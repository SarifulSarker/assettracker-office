import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
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
  const [status, setStatus] = useState("active"); // default active

  const handleSearchChange = (e) => {
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
    queryClient.invalidateQueries(["assets"]);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAssetApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["assets", page, searchKey, status]);
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

  // Convert status string to boolean before sending to API
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["assets", page, searchKey, status],
    queryFn: () =>
      getAllAssetsApi({
        page,
        perpage: PAGE_SIZE,
        search: searchKey,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  if (isError) return <Text color="red">{error.message}</Text>;

  const assets = data?.data?.assets || [];
  const total = data?.data?.total || 0;

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
    { key: "specs", headerTitle: "Specs", row: (v, row) => row.specs || "-" },
    {
      key: "mainCategory",
      headerTitle: "Category",
      row: (v, row) => row.category?.name || "-",
    },
    {
      key: "subCategory",
      headerTitle: "Subcategory",
      row: (v, row) => row.subCategory?.name || "-",
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
      key: "actions",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Tooltip label="Edit Asset" withArrow>
            <Button
              size="xs"
              onClick={() => navigate(`/asset/edit/${row.id}`)}
              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
            >
              <IconEdit size={14} />
            </Button>
          </Tooltip>

          <Tooltip label="Delete Asset" color="red" withArrow>
            <Button
              size="xs"
              onClick={() => openDeleteModal(row.id)}
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
            >
              <IconTrash size={14} />
            </Button>
          </Tooltip>

          <Tooltip label="Asset History" color="green" withArrow>
            <Button
              size="xs"
              onClick={() => navigate(`/asset-log/${row.id}`)}
              style={{ backgroundColor: "#10b981", color: "#fff" }}
            >
              <IconHistory size={14} />
            </Button>
          </Tooltip>
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
            status={status}
            onStatusChange={handleStatusChange}
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
