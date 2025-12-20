import {
  Button,
  Stack,
  PasswordInput,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import COLORS from "../../constants/Colors";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";

const NewPasswordInput = () => {
  const [visible1, { toggle: toggle1 }] = useDisclosure(false);
  const [visible2, { toggle: toggle2 }] = useDisclosure(false);

  const navigate = useNavigate();

const email = useSelector((state) => state.auth.tempData);

const schema = Yup.object().shape({
  NewPassword: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
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
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/reset-password",
        {
          email,
          newPassword: values.NewPassword,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Password has been reset successfully",
          color: "green",
        });
        navigate("/signin");
      } else {
        notifications.show({
          title: "Error",
          message: data.message || "Failed to reset password",
          color: "red",
        });
      }
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => resetPasswordMutate(values))}>
      <Stack>
     
        <PasswordInput
          {...form.getInputProps("NewPassword")}
          placeholder="Your Password"
          visible={visible1}
          onVisibilityChange={toggle1}
        />
        <PasswordInput
          {...form.getInputProps("confirmNewPassword")}
          placeholder="Confirm Password"
          visible={visible2}
          onVisibilityChange={toggle2}
        />
        <Button
          style={{ backgroundColor: COLORS.primary }}
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
