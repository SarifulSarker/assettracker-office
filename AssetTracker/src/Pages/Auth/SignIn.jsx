import {
  Box,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Checkbox,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/reducers/authReducer.js";
import { getCookie } from "../../helpers/Cookie.js";
import COLORS from "../../constants/Colors.js";

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [remember, setRemember] = useState(true);

  const form = useForm({
    initialValues: {
      email: getCookie("email") || "",
      password: getCookie("password") || "",
    },
    validate: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/signin",
        values
      );
      return response.data;
    },
    onSuccess: (data) => {
   
      if (data.success) {
        dispatch(
          loginSuccess({
            user: data.data,
            remember: remember,
            email: form.values.email,
            password: form.values.password, // ✅ add this
            token: data.token,
          })
        );

        notifications.show({
          title: "Success",
          message: "Login successful! Redirecting...",
          color: "green",
        });
        navigate("/dashboard");
      } else {
        notifications.show({
          title: "Error",
          message: data.error || "Login failed",
          color: "red",
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Something went wrong",
        color: "red",
      });
    },
  });

  useEffect(() => {
    const savedEmail = getCookie("email");
    const savedPassword = getCookie("password");
    if (savedEmail) form.setFieldValue("email", savedEmail);
    if (savedPassword) form.setFieldValue("password", savedPassword);
  }, []);

  return (
    <Stack
      align="center"
      justify="center"
      style={{
        height: "100vh",
        position: "relative",
        background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)",
      }}
    >
      {/* Login Card */}
      <Paper
        p="xl"
        radius="md"
        shadow="xl"
        style={{ minWidth: 320, maxWidth: 400, width: "100%" }}
      >
        <div>sariful@gmail.com || 111111</div>
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <Stack spacing="md">
            <Title order={3} align="center">
              Login
            </Title>
            <Text align="center" color={COLORS.dimmed}>
              Distribution Portal
            </Text>

            <TextInput
              label="Email"
              placeholder="john.doe@email.com"
              {...form.getInputProps("email")}
              error={
                form.errors.email && (
                  <Text color={COLORS.error}>{form.errors.email}</Text>
                )
              }
            />

            <PasswordInput
              label="Password"
              placeholder="*******"
              {...form.getInputProps("password")}
              error={
                form.errors.password && (
                  <Text color={COLORS.error}>{form.errors.password}</Text>
                )
              }
            />

            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.currentTarget.checked)}
              styles={{
                checkbox: {
                  borderColor: "#000",
                  "&:checked": {
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primary,
                    color: "#000",
                  },
                },
                label: { color: "#333" },
              }}
            />

            <Text
              align="left"
              color={COLORS.accent}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/forget-password")}
            >
              Forgot Password?
            </Text>

            <Button
              type="submit"
              radius="md"
              size="md"
              loading={mutation.isLoading}
              style={{
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: COLORS.secondary,
              }}
            >
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
};

export default SignIn;
