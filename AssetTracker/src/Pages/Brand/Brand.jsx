import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import BrandFilters from "../../components/Brand/BrandFilters.jsx";
import BrandCreateModal from "../../components/Brand/BrandCreateModal.jsx";
import BrandEditModal from "../../components/Brand/BrandEditModal.jsx";

import { getAllBrandsApi, deleteBrandApi } from "../../services/brand.js";
import useDebounce from "../../hooks/useDebounce.js";
const PAGE_SIZE = 10;

const Brand = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 2000); // 3 sec delay

  // fetch brands
  const { data, isLoading, isRefetching, isPending } = useQuery({
    queryKey: ["brands", page, debouncedSearch],
    queryFn: () =>
      getAllBrandsApi({ page, pageSize: PAGE_SIZE, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const brands = data?.data?.brands || [];
  //console.log(data?.data?.brands)
  const total = data?.data?.total || 0;

  // search handler
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  // Delete brand
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBrandApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["brands"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Brand deleted successfully!",
        position: "top-center",
        color:"green"
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this brand?</Text>,
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

  const handleRefresh = () => {
    setSearchKey("");
    setPage(1);
    queryClient.invalidateQueries(["brands"]);
  };

  return (
    <div>
      <PageTop PAGE_TITLE="Brand Management" backBtn={false} />

      <TablePaperContent
        filters={
          <BrandFilters
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
