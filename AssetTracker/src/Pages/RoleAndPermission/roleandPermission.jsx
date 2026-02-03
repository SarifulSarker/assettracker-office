import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Button,
  Group,
  Text,
  Flex,
  Tooltip,
  Badge,
  Stack,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import PageTop from "../../components/global/PageTop.jsx";
import useDebounce from "../../hooks/useDebounce.js";

import {
  GetRoleAndPermissionApi,
  createRoleAndPermissionApi,
} from "../../services/roleandPermission";
import TablePaperContent from "../../components/global/TablePaperContent.jsx";
import RoleAndPermissionFilters from "../../components/RoleAndPermission/RoleAndPermissionFilters.jsx";
import RoleAndPermissionCreateModel from "../../components/RoleAndPermission/RoleAndPermissionCreateModel.jsx";
import RoleAndPermissionEditModel from "../../components/RoleAndPermission/RoleAndPermissionEditModel.jsx";
const PAGE_SIZE = 10;

const RoleAndPermission = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const debouncedSearch = useDebounce(searchKey, 2000);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSearch = (e) => {
    setSearchKey(e.currentTarget.value);
    setPage(1);
  };

  const handleRefresh = () => {
    setSearchKey("");
    setPage(1);
    queryClient.invalidateQueries(["roles"]);
  };

  const openDeleteModal = (id) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Are you sure to delete this role?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => mutation.mutate(id),
    });
  };

  const mutation = useMutation({
    mutationFn: (id) => GetRoleAndPermissionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["roles", page, debouncedSearch]);
      closeAllModals();
      notifications.show({
        title: "Success",
        message: "Role deleted successfully!",
        position: "top-center",
      });
    },
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["roles", page, debouncedSearch],
    queryFn: () =>
      GetRoleAndPermissionApi({
        page,
        perpage: PAGE_SIZE,
        search: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  if (isError) return <Text color="red">{error.message}</Text>;

  const roles = data?.data?.roles || [];
  const total = data?.data?.total || 0;

  const openEditModal = (roles) => {
  
    setSelectedRole(roles);
    setEditModalOpened(true);
  };

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    { key: "role", headerTitle: "Role", row: (v, row) => row.role },

    {
      key: "permissions",
      headerTitle: "Permissions",
      row: (v, row) => {
        const modules = row.permission?.modules || {};
        const moduleNames = Object.keys(modules).map((modKey) =>
          modKey.toUpperCase(),
        );

        if (moduleNames.length === 0) return <Text>-</Text>;

        // chunk into groups of 5 modules
        const chunkSize = 5;
        const chunks = [];
        for (let i = 0; i < moduleNames.length; i += chunkSize) {
          chunks.push(moduleNames.slice(i, i + chunkSize));
        }

        return (
          <Stack spacing={4}>
            {chunks.map((group, idx) => (
              <Group key={idx} spacing="xs">
                {group.map((mod, i) => (
                  <Badge
                    key={`${idx}-${i}`}
                    color="blue"
                    variant="filled"
                    radius="xl"
                    size="sm"
                  >
                    {mod}
                  </Badge>
                ))}
              </Group>
            ))}
          </Stack>
        );
      },
    },
    {
      key: "actions",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Tooltip label="Edit role" withArrow position="top">
            <Button
              size="xs"
              onClick={() => openEditModal(row)}
              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
            >
              <IconEdit size={14} />
            </Button>
          </Tooltip>
          <Tooltip label="Delete role" withArrow position="top">
            <Button
              size="xs"
              onClick={() => openDeleteModal(row.id)}
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
            >
              <IconTrash size={14} />
            </Button>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <div>
      <TablePaperContent
        filters={
          <RoleAndPermissionFilters
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
            data={roles}
            isFetching={isLoading || isFetching}
          />
        }
      />

      <RoleAndPermissionCreateModel
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={() => queryClient.invalidateQueries(["roles"])}
      />

      <RoleAndPermissionEditModel
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        roles={selectedRole}
        onSuccess={() => queryClient.invalidateQueries(["brands"])}
      />
    </div>
  );
};

export default RoleAndPermission;
