import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";

import VendorFilters from "../../components/Vendor/VendorFilters.jsx";
import VendorCreateModal from "../../components/Vendor/CreateVendorModal.jsx";
import VendorEditModal from "../../components/Vendor/EditVendorModal.jsx";

import { getAllVendorsApi, deleteVendorApi } from "../../services/vendor.js";
import useDebounce from "../../hooks/useDebounce.js";
import { usePermissions } from "../../hooks/useAuthPermissions.js";
import StandardFilters from "../../constants/StandardFilters.jsx";

const PAGE_SIZE = 10;

const Vendor = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // ✅ default active
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);
  const { hasPermission } = usePermissions();

  // 🔁 convert status string → boolean
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  // Fetch vendors
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vendors", page, debouncedSearch, status],
    queryFn: () =>
      getAllVendorsApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  const vendors = data?.data?.vendors || [];
  const total = data?.data?.total || 0;

  // Search
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  // Status
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  // Delete
  const deleteMutation = useMutation({
    mutationFn: deleteVendorApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
      closeAllModals();
      notifications.show({
        title: statusBool ? "Delete" : "Activate",
        message: "Vendor deleted successfully!",
        position: "top-center",
        color: "green",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: (
        <Text size="sm">
          {statusBool
            ? "Do you want to delete this vendor?"
            : "Do you want to activate this vendor?"}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setEditModalOpened(true);
  };

  // Table headers
  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, r, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    { key: "name", headerTitle: "Vendor Name", row: (v, r) => r.name },
    { key: "email", headerTitle: "Email", row: (v, r) => r.email || "-" },
    { key: "contact", headerTitle: "Contact", row: (v, r) => r.contact || "-" },
    {
      key: "action",
      headerTitle: "Actions",
      row: (v, r) => (
        <Group spacing="xs">
          {hasPermission("vendor", "edit") && (
            <Tooltip label="Edit" withArrow>
              <Button size="xs" onClick={() => openEditModal(r)}>
                <IconEdit size={14} />
              </Button>
            </Tooltip>
          )}

          {hasPermission("vendor", "delete") && (
            <Tooltip
              label={statusBool ? "Delete" : "Activate"}
              withArrow
              position="top"
            >
              <Button
                size="xs"
                onClick={() => openDeleteModal(r.id)}
                style={{
                  backgroundColor: statusBool ? "#ef4444" : "#10b981", // red if active, green if inactive
                  color: "#fff",
                }}
              >
                {statusBool ? <IconTrash size={14} /> : <IconCheck size={14} />}
              </Button>
            </Tooltip>
          )}
        </Group>
      ),
    },
  ];

  const handleRefresh = () => {
    setSearchKey("");
    setStatus("active");
    setPage(1);
    queryClient.invalidateQueries(["vendors"]);
  };

  return (
    <>
      <PageTop PAGE_TITLE="Vendor Management" />

      <TablePaperContent
        filters={
          // <VendorFilters
          //   searchKey={searchKey}
          //   status={status}
          //   onSearchChange={handleSearch}
          //   onStatusChange={handleStatusChange}
          //   onRefresh={handleRefresh}
          //   onCreate={() => setCreateModalOpened(true)}
          // />
           <StandardFilters
            searchKey={searchKey}
            status={status}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusChange}
            onRefresh={handleRefresh}
            onCreate={() => setCreateModalOpened(true)}
          />
        }
        exportAndPagination={
          <Flex justify="flex-end">
            <CustomPagination
              page={page}
              setPage={setPage}
              total={total}
              pageSize={PAGE_SIZE}
            />
          </Flex>
        }
        table={
          <CustomTable
            tableHeaders={tableHeaders}
            data={vendors}
            isFetching={isLoading || isFetching}
          />
        }
      />

      <VendorCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["vendors"])}
      />

      <VendorEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        vendor={selectedVendor}
        onSuccess={() => queryClient.invalidateQueries(["vendors"])}
      />
    </>
  );
};

export default Vendor;
