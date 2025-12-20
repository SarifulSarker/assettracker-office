import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex } from "@mantine/core";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import CustomTable from "../../components/global/CustomTable.jsx";
import CustomPagination from "../../components/global/CustomPagination.jsx";

import EmployeeFilters from "../../components/Employee/EmployeeFilters.jsx";
import EmployeeCreateModal from "../../components/Employee/EmployeeCreateModal.jsx";
import EmployeeEditModal from "../../components/Employee/EmployeeEditModal.jsx";

import {
  getAllEmployeesApi,
  deleteEmployeeApi,
} from "../../services/employee.js";
import useDebounce from "../../hooks/useDebounce.js";
import EmployeeAssetsModal from "../../components/Employee/EmployeeAssetsModal.jsx";

const PAGE_SIZE = 10;

const employee = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Inside component
  const [assetsModalOpened, setAssetsModalOpened] = useState(false);
  const [assetsForEmployee, setAssetsForEmployee] = useState([]);
  const [employeeForAssets, setEmployeeForAssets] = useState(null);

  const debouncedSearch = useDebounce(searchKey, 2000);
  // useMutation for fetching employee assets

  // Fetch employees
  const { data, isPending, isLoading, isRefetching } = useQuery({
    queryKey: ["employees", page, debouncedSearch],
    queryFn: () =>
      getAllEmployeesApi({
        page,
        perpage: PAGE_SIZE,
        search: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  const employees = data?.data?.employees || [];
  const total = data?.data?.total || 0;

  // Search handler
  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  // Delete employee
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEmployeeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      closeAllModals();
      notifications.show({
        title: "Deleted",
        message: "Employee deleted successfully!",
        position: "top-center",
      });
    },
  });

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Do you want to delete this employee?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const openAssetsModal = (employee) => {
    setEmployeeForAssets(employee);
    setAssetsModalOpened(true);
  };

  // Edit modal
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpened(true);
  };

  // Table headers
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

          <Button
            size="xs"
            onClick={() => openAssetsModal(row)}
            style={{ backgroundColor: "#10b981", color: "#fff" }}
          >
            Details
          </Button>
        </Group>
      ),
    },
  ];

  // Refresh
  const handleRefresh = () => {
    setSearchKey("");
    setPage(1);
    queryClient.invalidateQueries(["employees"]);
  };

  return (
    <div>
      <PageTop PAGE_TITLE="Employee Management" backBtn={false} />

      <TablePaperContent
        filters={
          <EmployeeFilters
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
            data={employees}
            isFetching={isPending || isLoading || isRefetching}
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
        employee={employeeForAssets} // pass the full employee object
      />
    </div>
  );
};

export default employee;
