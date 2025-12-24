import React from "react";
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Text, Anchor } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import COLORS from "../../constants/Colors"; // Make sure you have a COLORS file

// -------------------- Validation Schema --------------------
const schema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  phone: Yup.string().required("Phone number is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
    
});

const Signup = () => {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
    },
    validate: yupResolver(schema),
  });

  const signupMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post("http://localhost:3000/api/v1/auth/signup", formData);
      return res.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message || 'Account created successfully!',
        color: 'green',
        autoClose: 3000,
      });
      form.reset();
      navigate("/signin");
    },
    onError: (err) => {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error || 'Signup failed. Try again!',
        color: 'red',
        autoClose: 3000,
      });
    }
  });

  const handleSubmit = () => {
    signupMutation.mutate(form.values);
  };

  return (
    <Stack
      align="center"
      justify="center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)",
      }}
    >
      {/* Signup Card */}
      <Paper p="xl" radius="md" shadow="xl" style={{ minWidth: 320, maxWidth: 400, width: "100%" }}>
        <Title order={2} align="center" mb="md">
          Create an Account
        </Title>
        <Text align="center" color={COLORS.dimmed} mb="lg">
          Join our platform to get started
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              {...form.getInputProps("first_name")}
            />
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              {...form.getInputProps("last_name")}
            />
            <TextInput
              label="Phone Number"
              placeholder="01xxxxxxxxx"
              required
              {...form.getInputProps("phone")}
            />
            <TextInput
              label="Email Address"
              placeholder="example@gmail.com"
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              required
              {...form.getInputProps("password")}
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              radius="md"
              loading={signupMutation.isLoading}
              style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`, color: COLORS.secondary }}
            >
              Sign Up
            </Button>

            <Text align="center" mt="sm">
              Already have an account?{" "}
              <Anchor color={COLORS.accent} style={{ cursor: "pointer" }} onClick={() => navigate("/signin")}>
                Sign In
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
};

export default Signup;
