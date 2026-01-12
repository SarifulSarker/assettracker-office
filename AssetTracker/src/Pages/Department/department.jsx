import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";

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
import dayjs from "dayjs";

const PAGE_SIZE = 10;

const Department = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // default active
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);

  // Convert status string to boolean
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  // fetch departments
  const { data, isLoading, isRefetching, isPending } = useQuery({
    queryKey: ["departments", page, debouncedSearch, status],
    queryFn: () =>
      getAllDepartmentsApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  const departments = data?.data?.departments || [];
  const total = data?.data?.total || 0;

  // Handlers
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
    queryClient.invalidateQueries(["departments"]);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDepartmentApi(id),
    onSuccess: (response) => {
      // response = backend theke return kora data
      const msg = response?.message || "Operation successful!";

      queryClient.invalidateQueries(["departments"]);
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
            ? "Do you want to delete this department?"
            : "Do you want to activate this department?"}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setEditModalOpened(true);
  };

  // Table headers
  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, r, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    { key: "name", headerTitle: "Department Name", row: (v, r) => r.name },

    {
      key: "createdAt",
      headerTitle: "Created At",
      row: (v, r) => dayjs(r.createdAt).format("DD-MM-YYYY hh:mm A"),
    },
    {
      key: "action",
      headerTitle: "Actions",
      row: (v, r) => (
        <Group spacing="xs">
          <Tooltip label="Edit" withArrow>
            <Button
              size="xs"
              onClick={() => openEditModal(r)}
              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
            >
              <IconEdit size={14} />
            </Button>
          </Tooltip>

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
        </Group>
      ),
    },
  ];

  return (
    <div>
      <PageTop PAGE_TITLE="Department Management" backBtn={false} />

      <TablePaperContent
        filters={
          <DepartmentFilters
            searchKey={searchKey}
            status={status}
            onStatusChange={handleStatusChange}
            onSearchChange={handleSearchChange}
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
