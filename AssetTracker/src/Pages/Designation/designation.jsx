import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
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

const Designation = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // default active
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);

  // Convert status string to boolean before sending API
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["designations", page, debouncedSearch, status],
    queryFn: () =>
      getAllDesignationsApi({
        page,
        perpage: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  const designations = data?.data?.designations || [];
  const total = data?.data?.total || 0;

  // Delete mutation
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
    queryClient.invalidateQueries(["designations"]);
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
      key: "action",
      headerTitle: "Actions",
      row: (v, r) => (
        <Group spacing="xs">
          <Tooltip label="Edit" withArrow>
            <Button size="xs" onClick={() => openEditModal(r)}>
              <IconEdit size={14} />
            </Button>
          </Tooltip>

          <Tooltip label="Delete" withArrow>
            <Button size="xs" color="red" onClick={() => openDeleteModal(r.id)}>
              <IconTrash size={14} />
            </Button>
          </Tooltip>
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
            status={status}
            onStatusChange={handleStatusChange}
            onSearchChange={handleSearchChange}
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

export default Designation;
