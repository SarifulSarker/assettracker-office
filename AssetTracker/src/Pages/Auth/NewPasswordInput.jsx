import { Button, Stack, PasswordInput } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import COLORS from "../../constants/Colors";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { Text } from "@mantine/core";

import { resetPasswordApi } from "../../services/auth.js";

const NewPasswordInput = () => {
  const [visible1, { toggle: toggle1 }] = useDisclosure(false);
  const [visible2, { toggle: toggle2 }] = useDisclosure(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const email = useSelector((state) => state.auth.tempData);

  const schema = Yup.object().shape({
    NewPassword: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(12, "Password cannot exceed 12 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
        "Password must contain 1 uppercase, 1 lowercase, and 1 special character",
      ),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("NewPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const form = useForm({
    initialValues: { NewPassword: "", confirmNewPassword: "" },
    validate: yupResolver(schema),
  });

  const { mutate: resetPasswordMutate, isLoading: isResetting } = useMutation({
    mutationFn: async (values) => {
      return await resetPasswordApi({
        email,
        newPassword: values.NewPassword,
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Password has been reset successfully",
          color: "green",
          position: "top-center",
        });
        navigate("/");
      } else {
        notifications.show({
          title: "Error",
          message: data.message || "Failed to reset password",
          color: "red",
          position: "top-center",
        });
      }
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
        position: "top-center",
      });
    },
  });
  const passwordRules = {
    minLength: password.length >= 6,
    maxLength: password.length <= 12,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  return (
    <form onSubmit={form.onSubmit((values) => resetPasswordMutate(values))}>
      <Stack>
        <PasswordInput
          placeholder="New Password"
          visible={visible1}
          onVisibilityChange={toggle1}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            form.setFieldValue("NewPassword", e.target.value);
          }}
          error={form.errors.NewPassword}
        />
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

          <Text color={passwordRules.hasSpecial ? "green" : "red"} size="sm">
            {passwordRules.hasSpecial ? "✔" : "✖"} At least 1 special (!@#$%^&*)
          </Text>
        </div>

        <PasswordInput
          {...form.getInputProps("confirmNewPassword")}
          placeholder="Confirm New Password"
          visible={visible2}
          onVisibilityChange={toggle2}
        />
        <Button
          style={{ backgroundColor: COLORS.app_color }}
          type="submit"
          loading={isResetting}
        >
          Set Password
        </Button>
      </Stack>
    </form>
  );
};

export default NewPasswordInput;
