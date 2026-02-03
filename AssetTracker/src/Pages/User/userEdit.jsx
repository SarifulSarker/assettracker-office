import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, TextInput, Button, Paper, Text } from "@mantine/core";
import { Select } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserByIdApi, updateUserApi } from "../../services/user";
import { notifications } from "@mantine/notifications";
import * as Yup from "yup";
import { IconCheck, IconX } from "@tabler/icons-react";
import PageTop from "../../components/global/PageTop.jsx";
import { GetRoleAndPermissionApi } from "../../services/roleandPermission";
// Validation Schema
const schema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\+?[0-9]{11,15}$/, "Phone number must be 11-15 digits"),
});

const UserEdit = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user by ID
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", uid],
    queryFn: () => getUserByIdApi(uid),
  });
  const { data: roleRes, isLoading: roleLoading } = useQuery({
    queryKey: ["roles", 1, ""],
    queryFn: () =>
      GetRoleAndPermissionApi({
        page: 1,
        perpage: 100,
        search: "",
      }),
  });
  const roles = roleRes?.data?.roles || [];
  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.role, // 👈 শুধু role name
  }));

  // Initialize form
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      roleId: "", // 👈 NEW
    },
    validate: yupResolver(schema),
  });

  // Set form values when user data arrives
  useEffect(() => {
    if (user?.data) {
      form.setValues({
        first_name: user.data.firstName || "",
        last_name: user.data.lastName || "",
        email: user.data.email || "",
        phone: user.data.phone || "",
        roleId: user.data.roleId ? String(user.data.roleId) : "",
      });
    }
  }, [user]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (values) => updateUserApi({ uid, data: values }),

    onSuccess: (res) => {
      // 🟥 Case 2: business error (success = false)
      if (!res?.success) {
        notifications.show({
          title: "Error",
          message: res?.message || "Something went wrong",
          color: "red",
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // 🟩 Case 1: real success
      queryClient.invalidateQueries(["users"]);

      notifications.show({
        title: "Success",
        message: res?.message || "User updated successfully!",
        color: "green",
        position: "top-center",
        autoClose: 3000,
      });

      navigate("/user");
    },

    onError: (error) => {
      // Network / Server error (5xx, no response, timeout)
      notifications.show({
        title: "Server Error",
        message: error?.response?.data?.message || "Unable to reach server",
        color: "red",
        position: "top-center",
        autoClose: 3000,
      });
    },
  });

  const handleSubmit = (values) => {
    mutation.mutate({
      ...values,
      roleId: Number(values.roleId),
    });
  };

  if (isLoading) return <Text>Loading user...</Text>;

  return (
    <>
      <PageTop PAGE_TITLE="Edit User" backBtn={true} />

      <Box style={{ maxWidth: 600, margin: "50px auto" }}>
        <Paper
          p="xl"
          shadow="xl"
          radius="lg"
          style={{ border: "1px solid #e0e0e0", background: "#fff" }}
        >
          <Text size="xl" fw={700} mb="md">
            Edit User
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="First Name"
                withAsterisk
                {...form.getInputProps("first_name")}
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: 10,
                  },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
              />
              <TextInput
                label="Last Name"
                withAsterisk
                {...form.getInputProps("last_name")}
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: 10,
                  },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
              />
              <TextInput
                label="Email"
                withAsterisk
                {...form.getInputProps("email")}
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: 10,
                  },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
              />
              <TextInput
                label="Phone Number"
                withAsterisk
                {...form.getInputProps("phone")}
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: 10,
                  },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
              />
              <Select
                label="Role"
                placeholder="Select role"
                data={roleOptions}
                withAsterisk
                searchable
                clearable
                disabled={roleLoading}
                {...form.getInputProps("roleId")}
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: 10,
                  },
                  label: { fontWeight: 600 },
                }}
              />

              <Button
                type="submit"
                size="md"
                radius="md"
                loading={mutation.isLoading}
                styles={{
                  root: {
                    backgroundColor: "#0f4794",
                    fontWeight: 700,
                    padding: "12px 20px",
                    fontSize: 16,
                    borderRadius: 10,
                    transition: "0.3s",
                  },
                  rootHovered: { backgroundColor: "#0c3a78" },
                }}
              >
                Update User
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default UserEdit;
