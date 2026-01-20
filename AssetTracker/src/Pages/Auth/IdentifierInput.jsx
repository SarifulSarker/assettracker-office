import { useForm, yupResolver } from "@mantine/form";
import React from "react";
import { Button, Stack, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setTempData } from "../../store/reducers/authReducer";
import { notifications } from "@mantine/notifications";
import * as Yup from "yup";

import { checkEmailApi } from "../../services/auth.js";

// Validation
const passwordResetIdentifier = Yup.object().shape({
  identifier: Yup.string().email("Invalid email").required("Email is required"),
});

const IdentifierInput = ({ setforgotPasswordActiveStage }) => {
  const dispatch = useDispatch();

  const form = useForm({
    initialValues: { identifier: "" },
    validate: yupResolver(passwordResetIdentifier),
  });

  const { mutate: sendOtpMutate, isLoading: issendOtpIn } = useMutation({
    mutationFn: ({ identifier }) => checkEmailApi(identifier),

    onSuccess: (data, identifier) => {
     
      if (data.exists) {
        dispatch(setTempData(identifier));

        notifications.show({
          success: true,
          title: "OTP Sent",
          message: "An OTP has been sent to your registered email address",
        });

        setforgotPasswordActiveStage({
          identifierInput: false,
          otpInput: true,
          passwordInput: false,
        });
      } else {
        notifications.show({
          success: false,
          title: "Error",
          message: "Email does not exist",
        });
      }
    },

    onError: (error) => {
      notifications.show({
        success: false,
        title: "Error",
        message: "Something went wrong. Try again.",
      });
      console.error(error);
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => sendOtpMutate(values))}>
      <Stack>
        <TextInput
          label="Email"
          placeholder="Enter your email here"
          type="text"
          {...form.getInputProps("identifier")}
        />

        <Button
          type="submit"
          loading={issendOtpIn}
          style={{ backgroundColor: "#0f4794" }}
        >
          Send OTP
        </Button>
      </Stack>
    </form>
  );
};

export default IdentifierInput;
