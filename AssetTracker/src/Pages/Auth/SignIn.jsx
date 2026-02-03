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
import { dataTagErrorSymbol, useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/reducers/authReducer.js";
import { getCookie } from "../../helpers/Cookie.js";
import COLORS from "../../constants/Colors.js";
import { signInApi } from "../../services/auth.js";
/* ================== Validation ================== */
const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
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
      password: "",
    },
    validate: yupResolver(schema),
  });

  /* ================== API ================== */
  const mutation = useMutation({
    mutationFn: (values) => signInApi(values),

    onSuccess: (response, values) => {
      if (!response.success) {
        notifications.show({
          message: response.error || "Login failed",
          color: "red",
          position: "top-center",
        });
        return;
      }

      const { data: user, token, message } = response;
      const userName = `${user.firstName} ${user.lastName}`;

      dispatch(
        loginSuccess({
          user,
          token,
          remember: remember,
          email: response.data.email,
        }),
      );

      notifications.show({
        message: `🎉 Welcome back ${userName}`,
        color: "green",
        position: "top-center",
      });

      navigate("/dashboard");
    },

    onError: (error) => {
      notifications.show({
        message:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        color: "red",
        position: "top-center",
      });
    },
  });

  /* ================== Remember Me ================== */
  useEffect(() => {
    const email = getCookie("email");

    if (email) form.setFieldValue("email", email);
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
        <form
          onSubmit={form.onSubmit((values) =>
            mutation.mutate({
              ...values,
              email: values.email.trim(), // ⭐ double safety
            }),
          )}
        >
          <Stack spacing="md">
            <Title order={3} ta="center">
              Login
            </Title>
            <div>sariful@manush.tech || Super@123</div>
            <Text ta="center" c={COLORS.dimmed}>
              Distribution Portal
            </Text>

            <TextInput label="Email" {...form.getInputProps("email")} />

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
              c={COLORS.app_color}
              fw={600}
              
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
               fz={20}
              style={{
                color: COLORS.app_color,
              }}
            >
              Login
            </Button>

            {/* ===== Sign Up Link ===== */}
            <Text ta="center" size="sm">
              Don’t have an account?{" "}
              <Text
                component="span"
                c={COLORS.app_color}
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
