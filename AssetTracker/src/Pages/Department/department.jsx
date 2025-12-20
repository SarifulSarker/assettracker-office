import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import DepartmentFilters from "../../components/department/DepartmentFilters";
import DepartmentCreateModal from "../../components/department/DepartmentCreateModal.jsx";
import DepartmentEditModal from "../../components/department/DepartmentEditModal";

import {
  getAllDepartmentsApi,
  deleteDepartmentApi,
} from "../../services/department.js";
import useDebounce from "../../hooks/useDebounce.js";
const PAGE_SIZE = 10;

const Department = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 2000); // 3 sec delay

  // fetch departments
  const { data, isLoading, isRefetching, isPending } = useQuery({
    queryKey: ["departments", page, debouncedSearch],
    queryFn: () =>
      getAllDepartmentsApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  const departments = data?.data?.departments || [];
  const total = data?.data?.total || 0;

  // search handler
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  // Delete department
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDepartmentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Department deleted successfully!",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this department?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  // Edit modal
  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setEditModalOpened(true);
  };

  // Table headers
  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: "name", headerTitle: "Department Name", row: (v, row) => row.name },
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
    queryClient.invalidateQueries(["departments"]);
  };

  return (
    <div>
      <PageTop PAGE_TITLE="Department Management" backBtn={false} />

      <TablePaperContent
        filters={
          <DepartmentFilters
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
            data={departments}
            isFetching={isPending || isLoading || isRefetching}
          />
        }
      />

      <DepartmentCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["departments"])}
      />

      <DepartmentEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        department={selectedDepartment}
        onSuccess={() => queryClient.invalidateQueries(["departments"])}
      />
    </div>
  );
};

export default Department;
