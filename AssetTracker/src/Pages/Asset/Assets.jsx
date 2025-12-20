import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconHistory } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";
import AssetFilters from "../../components/Asset/AssetFilters.jsx";

import { getAllAssetsApi, deleteAssetApi } from "../../services/asset.js";

const PAGE_SIZE = 10;

const Assets = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");

  const debouncedSearch = searchKey;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["assets", page, debouncedSearch],
    queryFn: () =>
      getAllAssetsApi({ page, pageSize: PAGE_SIZE, search: debouncedSearch }),
    keepPreviousData: true,
  });

  if (isError) return <Text color="red">{error.message}</Text>;

  const assets = data?.data?.assets || [];
  const total = data?.data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAssetApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["assets"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Asset deleted successfully!",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this asset?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleSearchChange = (e) => setSearchKey(e.currentTarget.value);
  const handleRefresh = () => {
    setSearchKey("");
    setPage(1);
    queryClient.invalidateQueries(["assets"]);
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    {
      key: "name",
      headerTitle: "Asset Name",
      row: (v, row) => row.name || "-",
    },
    {
      key: "mainCategory",
      headerTitle: "Category",
      row: (v, row) =>
        row.subCategory ? row.category?.name || "-" : row.category?.name || "-", // main category if no sub
    },
    {
      key: "subCategory",
      headerTitle: "Subcategory",
      row: (v, row) => row.subCategory?.name || "-", // show subcategory if exists
    },
    {
      key: "brand",
      headerTitle: "Brand",
      row: (v, row) => row.brand?.name || "-",
    },
    {
      key: "vendor",
      headerTitle: "Vendor",
      row: (v, row) => row.vendor?.name || "-",
    },
    {
      key: "status",
      headerTitle: "Status",
      row: (v, row) => row.status || "-",
    },
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
      key: "actions",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Button
            size="xs"
            onClick={() => navigate(`/asset/edit/${row.id}`)}
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

          {/* Asset Log */}
          <Button
            size="xs"
            onClick={() => navigate(`/asset-log/${row.id}`)}
            style={{ backgroundColor: "#10b981", color: "#fff" }}
          >
            <IconHistory size={14} />
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <div>
      <PageTop PAGE_TITLE="Asset Management" backBtn={false} />

      <TablePaperContent
        filters={
          <AssetFilters
            searchKey={searchKey}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            onCreate={() => navigate("/asset/create")}
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
            data={assets}
            isFetching={isLoading || isFetching}
          />
        }
      />
    </div>
  );
};

export default Assets;
