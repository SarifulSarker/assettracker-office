import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Group, Text, Flex, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { deleteUserApi, GetUserApi } from "../../services/user";
import CustomTable from "../../components/global/CustomTable";
import CustomPagination from "../../components/global/CustomPagination";
import { closeAllModals, modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import PageTop from "../../components/global/PageTop.jsx";
import UserFilters from "../../components/User/UserFilters.jsx";
import TablePaperContent from "../../components/global/TablePaperContent";
import useDebounce from "../../hooks/useDebounce.js";

const PAGE_SIZE = 10;

const User = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState("active"); // default active
  const debouncedSearch = useDebounce(searchKey, 2000);

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
    setStatus("active"); // reset to default active
    setPage(1);
    queryClient.invalidateQueries(["users"]);
  };

  const openDeleteModal = (uid) => {
    modals.openConfirmModal({
      title: "Are you sure?",
      children: <Text size="sm">Are You Sure To Delete This User?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => mutation.mutate(uid),
    });
  };

  const mutation = useMutation({
    mutationFn: (uid) => deleteUserApi(uid),
    onSuccess: () => {
      queryClient.invalidateQueries(["users", page, debouncedSearch, status]);
      closeAllModals();
      notifications.show({
        title: "Success",
        message: "User deleted successfully!",
        position: "top-center",
      });
    },
  });

  // Convert status string to boolean before sending to API
  const statusBool =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["users", page, debouncedSearch, status],
    queryFn: () =>
      GetUserApi({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusBool,
      }),
    keepPreviousData: true,
  });

  if (isError) return <Text color="red">{error.message}</Text>;

  const users = data?.users || [];
  const total = data?.total || 0;

  const tableHeaders = [
    {
      key: "sl",
      headerTitle: "SL",
      row: (v, row, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      key: "name",
      headerTitle: "Name",
      row: (v, row) => row.firstName + " " + row.lastName,
    },
    { key: "email", headerTitle: "Email" },
    { key: "phone", headerTitle: "Phone" },

    {
      key: "actions",
      headerTitle: "Actions",
      row: (v, row) => (
        <Group spacing="xs">
          <Tooltip label="Edit user" withArrow position="top">
            <Button
              size="xs"
              onClick={() => {
                navigate(`/user/edit/${row.uid}`);
              }}
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
      <PageTop PAGE_TITLE="User " backBtn={false} />

      <TablePaperContent
        filters={
          <UserFilters
            searchKey={searchKey}
            onSearchChange={handleSearch}
            onRefresh={handleRefresh}
            onCreate={() => navigate("/user/create")}
            status={status}
            onStatusChange={handleStatusChange}
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
            data={users}
            isFetching={isLoading || isFetching}
          />
        }
      />
    </div>
  );
};

export default User;
