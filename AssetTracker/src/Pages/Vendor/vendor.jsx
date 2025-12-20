import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Box, Typography } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";

import VendorFilters from "../../components/Vendor/VendorFilters.jsx";
import VendorCreateModal from "../../components/Vendor/CreateVendorModal.jsx";
import VendorEditModal from "../../components/Vendor/EditVendorModal.jsx";

import { getAllVendorsApi, deleteVendorApi } from "../../services/vendor.js";
import useDebounce from "../../hooks/useDebounce.js";

const PAGE_SIZE = 10;

const vendor = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 2000); // 2 sec

  // Fetch vendors
  const { data, isPending, isLoading, isRefetching } = useQuery({
    queryKey: ["vendors", page, debouncedSearch],
    queryFn: () =>
      getAllVendorsApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  const vendors = data?.data?.vendors || [];
  const total = data?.data?.total || 0;

  // Search handler
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  // Delete vendor
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteVendorApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Vendor deleted successfully!",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this vendor?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  // Edit modal
  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setEditModalOpened(true);
  };

  // Table headers
  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: "name", headerTitle: "Vendor Name", row: (v, row) => row.name },
    { key: "email", headerTitle: "Email", row: (v, row) => row.email },
    { key: "contact", headerTitle: "Contact", row: (v, row) => row.contact },
    {
      key: "is_active",
      headerTitle: "Status",
      row: (value, row) => {
        const active = row?.is_active;

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 500,
              color: active ? "#0f5132" : "#842029",
              backgroundColor: active ? "#d1e7dd" : "#f8d7da",
            }}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "action",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Button
            size="xs"
            onClick={() => openEditModal(row)}
            style={{ backgroundColor: "#3b82f6", color: "#fff" }}
          >
            <IconEdit size={14} />
          </Button>
          <Button
            size="xs"
            onClick={() => openDeleteModal(row.id)}
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
          >
            <IconTrash size={14} />
          </Button>
        </Group>
      ),
    },
  ];

  // Refresh
  const handleRefresh = () => {
    setSearchKey("");
    setPage(1);
    queryClient.invalidateQueries(["vendors"]);
  };

  return (
    <div>
      <PageTop PAGE_TITLE="Vendor Management" backBtn={false} />

      <TablePaperContent
        filters={
          <VendorFilters
            searchKey={searchKey}
            onSearchChange={handleSearch}
            onRefresh={handleRefresh}
            onCreate={() => setCreateModalOpened(true)}
          />
        }
        filterBadges={null}
        exportAndPagination={
          <Flex justify="flex-end" align="center">
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
            isFetching={isPending || isLoading || isRefetching}
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
    </div>
  );
};

export default vendor;
