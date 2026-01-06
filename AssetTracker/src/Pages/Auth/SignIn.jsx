import {
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

/* ================== Validation ================== */
const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [remember, setRemember] = useState(true);

  /* ================== Form ================== */
  const form = useForm({
    initialValues: {
      email: getCookie("email") || "",
      password: getCookie("password") || "",
    },
    validate: yupResolver(schema),
  });

  /* ================== API ================== */
  const mutation = useMutation({
    mutationFn: async (values) => {
      console.log({ values });
      const res = await axios.post(
        "http://localhost:3000/api/v1/auth/signin",
        values
      );
      return res.data;
    },

    onSuccess: (data) => {
      if (!data.success) {
        notifications.show({
          title: "Error",
          message: data.error || "Login failed",
          color: "red",
        });
        return;
      }

      dispatch(
        loginSuccess({
          user: data.data,
          token: data.token,
          remember,
          email: form.values.email,
          password: form.values.password,
        })
      );

      notifications.show({
        title: "Success",
        message: "Login successful! Redirecting...",
        color: "green",
      });

      navigate("/dashboard");
    },

    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Something went wrong",
        color: "red",
      });
    },
  });

  /* ================== Remember Me ================== */
  useEffect(() => {
    const email = getCookie("email");
    const password = getCookie("password");

    if (email) form.setFieldValue("email", email);
    if (password) form.setFieldValue("password", password);
  }, []);

  return (
    <Stack
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)",
      }}
    >
      <Paper p="xl" radius="md" shadow="xl" w={380}>
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <Stack spacing="md">
            <Title order={3} ta="center">
              Login
            </Title>
            <div>sariful@gmail.com || 111111</div>
            <Text ta="center" c={COLORS.dimmed}>
              Distribution Portal
            </Text>

            <TextInput
              label="Email"
              placeholder="john.doe@email.com"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Password"
              placeholder="********"
              {...form.getInputProps("password")}
            />

            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.currentTarget.checked)}
            />

            <Text
              size="sm"
              c={COLORS.accent}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/forget-password")}
            >
              Forgot password?
            </Text>

            <Button
              type="submit"
              loading={mutation.isPending}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: COLORS.secondary,
              }}
            >
              Login 
            </Button>

            {/* ===== Sign Up Link ===== */}
            <Text ta="center" size="sm">
              Don’t have an account?{" "}
              <Text
                component="span"
                c={COLORS.primary}
                fw={600}
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Text>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
};

export default SignIn;
