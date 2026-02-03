import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import BrandFilters from "../../components/Brand/BrandFilters.jsx";
import BrandCreateModal from "../../components/Brand/BrandCreateModal.jsx";
import BrandEditModal from "../../components/Brand/BrandEditModal.jsx";

import { getAllBrandsApi, deleteBrandApi } from "../../services/brand.js";
import useDebounce from "../../hooks/useDebounce.js";
import { usePermissions } from "../../hooks/useAuthPermissions.js";

const PAGE_SIZE = 10;

const Brand = () => {
  const queryClient = useQueryClient();

  const { hasPermission } = usePermissions();

  if (!hasPermission("brand", "view")) {
    return <Text>No permission to view users</Text>;
  }

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // ✅ default active
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);

  // 🔁 status string → boolean
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isRefetching, isPending } = useQuery({
    queryKey: ["brands", page, debouncedSearch, status],
    queryFn: () =>
      getAllBrandsApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  const brands = data?.data?.brands || [];
  const total = data?.data?.total || 0;

  // handlers
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleRefresh = () => {
    setSearchKey("");
    setStatus("active");
    setPage(1);
    queryClient.invalidateQueries(["brands"]);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBrandApi(id),
    onSuccess: (response) => {
      // response = backend theke return kora data
      const msg = response?.message || "Operation successful!";

      queryClient.invalidateQueries(["brands"]);
      closeAllModals();
      notifications.show({
        title: statusBool ? "Delete" : "Activate",
        message: msg, // backend message use kora hocche
        position: "top-center",
      });
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong!";
      notifications.show({
        title: "Error",
        message: msg,
        color: "red",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: (
        <Text size="sm">
          {statusBool
            ? "Do you want to delete this brand?"
            : "Do you want to activate this brand?"}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setEditModalOpened(true);
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: "name", headerTitle: "Brand Name", row: (v, row) => row.name },
    {
      key: "createdAt",
      headerTitle: "Created At",
      row: (keyData) => dayjs(keyData).format("DD-MM-YYYY hh:mm A"),
    },
    {
      key: "action",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          {hasPermission("brand", "edit") && (
            <Tooltip label="Edit" withArrow>
              <Button
                size="xs"
                onClick={() => openEditModal(row)}
                style={{ backgroundColor: "#3b82f6", color: "#fff" }}
              >
                <IconEdit size={14} />
              </Button>
            </Tooltip>
          )}

          {hasPermission("brand", statusBool ? "delete" : "view") && (
            <Tooltip
              label={statusBool ? "Delete" : "Activate"}
              withArrow
              position="top"
            >
              <Button
                size="xs"
                onClick={() => openDeleteModal(row.id)}
                style={{
                  backgroundColor: statusBool ? "#ef4444" : "#10b981",
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
    ,
  ];

  return (
    <div>
      <PageTop PAGE_TITLE="Brand Management" backBtn={false} />

      <TablePaperContent
        filters={
          <BrandFilters
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
            data={brands}
            isFetching={isPending || isLoading || isRefetching}
          />
        }
      />

      <BrandCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["brands"])}
      />

      <BrandEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        brand={selectedBrand}
        onSuccess={() => queryClient.invalidateQueries(["brands"])}
      />
    </div>
  );
};

export default Brand;
