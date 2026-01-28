import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  TextInput,
  Button,
  Stack,
  Paper,
  PasswordInput,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { createUserApi } from "../../services/user";
import { setCookie, getCookie } from "../../helpers/Cookie.js";
import PageTop from "../../components/global/PageTop.jsx";
// Validation Schema
const schema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")

    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation cannot exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\+?[0-9]{11,15}$/, "Phone number must be  digits")
    .trim(),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),
});

const UserCreate = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = getCookie("token");
    // console.log("Cookie loaded after mount:", t);
    setToken(t);
  }, []);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
    validate: yupResolver(schema),
  });

  
  const createUserMutation = useMutation({
    mutationFn: (value) => createUserApi(value),

    onSuccess: (res) => {
     
      //  Case 2: business error (success = false)
      if (!res?.success) {
        notifications.show({
          
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
        message: res.message || "User created successfully!",
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
    // console.log(values)
    createUserMutation.mutate(values);
  };

  return (
    <>
      <PageTop PAGE_TITLE="Create User" backBtn={true} />

      <Box style={{ maxWidth: 600, margin: "50px auto" }}>
        <Paper
          p="xl"
          shadow="xl"
          radius="lg"
          style={{
            border: "1px solid #e0e0e0",
            background: "#ffffff",
          }}
        >
          <Text size="xl" fw={700} mb="md">
            Create New User
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {/* Premium Styled Input */}
              <TextInput
                label="First Name"
                withAsterisk
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: "10px",
                    transition: "0.2s",
                  },
                  inputFocused: {
                    borderColor: "#0f4794",
                  },
                  label: {
                    fontWeight: 600,
                  },
                }}
                {...form.getInputProps("first_name")}
              />

              <TextInput
                label="Last Name"
                withAsterisk
                styles={{
                  input: {
                    border: "1px solid #b7c5d3",
                    borderRadius: 8,
                    padding: "10px",
                  },
                  inputFocused: {
                    borderColor: "#0f4794",
                  },
                  label: {
                    fontWeight: 600,
                  },
                }}
                {...form.getInputProps("last_name")}
              />

              <TextInput
                label="Email"
                withAsterisk
                styles={{
                  input: { border: "1px solid #b7c5d3", borderRadius: 8 },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
                {...form.getInputProps("email")}
              />

              <TextInput
                label="Phone Number"
                withAsterisk
                styles={{
                  input: { border: "1px solid #b7c5d3", borderRadius: 8 },
                  inputFocused: { borderColor: "#0f4794" },
                  label: { fontWeight: 600 },
                }}
                {...form.getInputProps("phone")}
              />

              {/* Premium Button */}
              <Button
                type="submit"
                size="md"
                radius="md"
                loading={createUserMutation.isLoading}
                styles={{
                  root: {
                    backgroundColor: "#0f4794",
                    fontWeight: 700,
                    padding: "12px 20px",
                    fontSize: 16,
                    borderRadius: 10,
                    transition: "0.3s",
                  },
                  rootHovered: {
                    backgroundColor: "#0c3a78",
                  },
                }}
              >
                Create User
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default UserCreate;
