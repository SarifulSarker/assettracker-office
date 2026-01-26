import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconEye, IconCheck } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";

import EmployeeFilters from "../../components/Employee/EmployeeFilters.jsx";
import EmployeeCreateModal from "../../components/Employee/EmployeeCreateModal.jsx";
import EmployeeEditModal from "../../components/Employee/EmployeeEditModal.jsx";
import EmployeeAssetsModal from "../../components/Employee/EmployeeAssetsModal.jsx";

import {
  getAllEmployeesApi,
  deleteEmployeeApi,
} from "../../services/employee.js";
import useDebounce from "../../hooks/useDebounce.js";

const PAGE_SIZE = 10;

const Employee = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // default active
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assetsModalOpened, setAssetsModalOpened] = useState(false);
  const [employeeForAssets, setEmployeeForAssets] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 1000);

  // Convert status string to boolean before sending to API
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  // Fetch employees
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["employees", page, debouncedSearch, status],
    queryFn: () =>
      getAllEmployeesApi({
        page,
        perpage: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  if (isError) return <Text color="red">{error.message}</Text>;

  const employees = data?.data?.employees || [];
  const total = data?.data?.total || 0;

  // Handlers
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
    queryClient.invalidateQueries(["employees"]);
  };

  const deleteMutation = useMutation({
    mutationFn: (uid) => deleteEmployeeApi(uid),
    onSuccess: (e) => {
      queryClient.invalidateQueries([
        "employees",
        page,
        debouncedSearch,
        status,
      ]);
      closeAllModals();
      notifications.show({
        title: statusBool ? "Delete" : "Activate",

        message: e.message || "Employee deleted successfully ",
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

  const openDeleteModal = (uid) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: (
        <Text size="sm">
          {statusBool
            ? "Do you want to delete this employee?"
            : "Do you want to activate this employee?"}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(uid),
    });
  };

  const openAssetsModal = (employee) => {
    setEmployeeForAssets(employee);
    setAssetsModalOpened(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpened(true);
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      key: "fullName",
      headerTitle: "Full Name",
      row: (v, row) => row.fullName,
    },
    { key: "email", headerTitle: "Email", row: (v, row) => row.email },
    { key: "phone", headerTitle: "Phone", row: (v, row) => row.phone },
    {
      key: "designation",
      headerTitle: "Designation",
      row: (v, row) => row.designation?.name || "-",
    },
    {
      key: "department",
      headerTitle: "Department",
      row: (v, row) => row.department?.name || "-",
    },

    {
      key: "action",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Tooltip label="Edit" withArrow position="top">
            <Button
              size="xs"
              onClick={() => openEditModal(row)}
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
              onClick={() => openDeleteModal(row.uid)}
              style={{
                backgroundColor: statusBool ? "#ef4444" : "#10b981", // red if active, green if inactive
                color: "#fff",
              }}
            >
              {statusBool ? <IconTrash size={14} /> : <IconCheck size={14} />}
            </Button>
          </Tooltip>

          <Tooltip label="View details" withArrow position="top">
            <Button
              size="xs"
              onClick={() => openAssetsModal(row)}
              style={{ backgroundColor: "#10b981", color: "#fff" }}
            >
              <IconEye size={14} />
            </Button>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <div>
      <PageTop PAGE_TITLE="Employee Management" backBtn={false} />

      <TablePaperContent
        filters={
          <EmployeeFilters
            searchKey={searchKey}
            status={status}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusChange}
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
            data={employees}
            isFetching={isLoading || isFetching}
          />
        }
      />

      <EmployeeCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["employees"])}
      />

      <EmployeeEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        employee={selectedEmployee}
        onSuccess={() => queryClient.invalidateQueries(["employees"])}
      />

      <EmployeeAssetsModal
        opened={assetsModalOpened}
        onClose={() => setAssetsModalOpened(false)}
        employee={employeeForAssets}
      />
    </div>
  );
};

export default Employee;
