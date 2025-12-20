import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, TextInput, Button, Paper, Text } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserByIdApi, updateUserApi } from "../../services/user";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import PageTop from "../../components/global/PageTop.jsx";
const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch user by ID
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserByIdApi(id),
  });

  // Set initial form values when data arrives
useEffect(() => {
  if (user?.data) {
    setFirstName(user.data.firstName || "");
    setLastName(user.data.lastName || "");
    setEmail(user.data.email || "");
    setPhone(user.data.phone || "");
  }
}, [user]);

  // Update Mutation
const mutation = useMutation({
  mutationFn: (data) => updateUserApi({ id, data }),
  onSuccess: () => {
    queryClient.invalidateQueries(["users"]);
    navigate("/user");

     notifications.show({
      title: 'Success',
      message: 'User updated successfully!',
      color: 'green',
      icon: <IconCheck size={18} />,
       position: 'top-center',
      autoClose: 3000,
    });
  },
  onError: (error) => {
     notifications.show({
      title: 'Error',
      message: error?.response?.data?.message || 'Failed to update user',
     
      icon: <IconX size={18} />,
      autoClose: 3000,
    });
  },
});



  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ firstName, lastName, email, phone });
  };

  if (isLoading) return <Text>Loading user...</Text>;

  return (
    <>
      <PageTop PAGE_TITLE="Create User" backBtn={true} />
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

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              withAsterisk
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              withAsterisk
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              withAsterisk
              styles={{
                input: { border: "1px solid #b7c5d3", borderRadius: 8 },
                inputFocused: { borderColor: "#0f4794" },
                label: { fontWeight: 600 },
              }}
            />
            <TextInput
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              styles={{
                input: { border: "1px solid #b7c5d3", borderRadius: 8 },
                inputFocused: { borderColor: "#0f4794" },
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
