import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex } from "@mantine/core";
import { modals, closeAllModals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";

import DesignationFilters from "../../components/Designation/DesignationFilters.jsx";
import DesignationCreateModal from "../../components/Designation/DesignationCreateModal.jsx";
import DesignationEditModal from "../../components/Designation/DesignationEditModal.jsx";

import {
  getAllDesignationsApi,
  deleteDesignationApi,
} from "../../services/designation.js";

import useDebounce from "../../hooks/useDebounce.js";

const PAGE_SIZE = 10;

const designation = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["designations", page, debouncedSearch],
    queryFn: () =>
      getAllDesignationsApi({
        page,
        perpage: PAGE_SIZE,
        search: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  const designations = data?.data?.designations || [];
  const total = data?.data?.total || 0;

  // delete
  const deleteMutation = useMutation({
    mutationFn: deleteDesignationApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["designations"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Designation deleted successfully",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Delete this designation?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const openEditModal = (designation) => {
    setSelectedDesignation(designation);
    setEditModalOpened(true);
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, r, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    { key: "name", headerTitle: "Name", row: (v, r) => r.name },
    {
      key: "description",
      headerTitle: "Description",
      row: (v, r) => r.description || "-",
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
      key: "action",
      headerTitle: "Actions",
      row: (v, r) => (
        <Group spacing="xs">
          <Button size="xs" onClick={() => openEditModal(r)}>
            <IconEdit size={14} />
          </Button>
          <Button size="xs" color="red" onClick={() => openDeleteModal(r.id)}>
            <IconTrash size={14} />
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <>
      <PageTop PAGE_TITLE="Designation Management" />

      <TablePaperContent
        filters={
          <DesignationFilters
            searchKey={searchKey}
            onSearchChange={(e) => {
              setSearchKey(e.currentTarget.value);
              setPage(1);
            }}
            onRefresh={() => {
              setSearchKey("");
              setPage(1);
              queryClient.invalidateQueries(["designations"]);
            }}
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
            data={designations}
            isFetching={isLoading || isFetching}
          />
        }
      />

      <DesignationCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
      />

      <DesignationEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        designation={selectedDesignation}
      />
    </>
  );
};

export default designation;
