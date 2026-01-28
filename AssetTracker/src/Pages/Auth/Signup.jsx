import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Text,
  Anchor,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import COLORS from "../../constants/Colors"; // Make sure you have a COLORS file
import { signUpApi } from "../../services/auth.js";

// -------------------- Validation Schema --------------------
const schema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  phone: Yup.string().required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .trim()
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password cannot exceed 12 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
      "Password must contain 1 uppercase, 1 lowercase, and 1 special character",
    ),
});

const Signup = () => {
  const [password, setPassword] = useState("");

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
    mutationFn: (value) => signUpApi(value),

    onSuccess: (res) => {
      console.log(res);
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
        message: error?.response?.data?.message || "Unable to reach server",
        color: "red",
        position: "top-center",
        autoClose: 3000,
      });
    },
  });

  const handleSubmit = () => {
    signupMutation.mutate(form.values); // <-- pass form data here
  };

  //password rules
  const passwordRules = {
    minLength: password.length >= 6,
    maxLength: password.length <= 12,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
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
      <Paper
        p="xl"
        radius="md"
        shadow="xl"
        style={{ minWidth: 320, maxWidth: 400, width: "100%" }}
      >
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                form.setFieldValue("password", e.target.value); // keep form in sync
              }}
            />
            {/* Real-time password rules */}
            <div style={{ marginTop: 8 }}>
              <Text color={passwordRules.minLength ? "green" : "red"} size="sm">
                {passwordRules.minLength ? "✔" : "✖"} Minimum 6 characters
              </Text>
              <Text color={passwordRules.maxLength ? "green" : "red"} size="sm">
                {passwordRules.maxLength ? "✔" : "✖"} Maximum 12 characters
              </Text>
              <Text color={passwordRules.hasLower ? "green" : "red"} size="sm">
                {passwordRules.hasLower ? "✔" : "✖"} At least 1 lowercase
              </Text>
              <Text color={passwordRules.hasUpper ? "green" : "red"} size="sm">
                {passwordRules.hasUpper ? "✔" : "✖"} At least 1 uppercase
              </Text>
              <Text
                color={passwordRules.hasSpecial ? "green" : "red"}
                size="sm"
              >
                {passwordRules.hasSpecial ? "✔" : "✖"} At least 1 special
                character (!@#$%^&*)
              </Text>
            </div>

            <Button
              type="submit"
              fullWidth
              size="md"
              radius="md"
              loading={signupMutation.isPending}
              style={{
                color: COLORS.app_color,
              }}
            >
              Sign Up
            </Button>

            <Text align="center" mt="sm">
              Already have an account?{" "}
              <Anchor
                color={COLORS.accent}
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/")}
              >
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
