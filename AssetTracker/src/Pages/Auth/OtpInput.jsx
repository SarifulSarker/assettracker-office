import {
  Button,
  Flex,
  LoadingOverlay,
  PinInput,
  Stack,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import COLORS from "../../constants/Colors";
import { notifications } from "@mantine/notifications";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
//import { authActions } from "../../store/reducers/authReducer";
import { hexToRgba } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OtpInput = ({
  email, // required for forgot password
  actionType, // optional: "mfa" or undefined
  setMfaVerifyActiveStage,
  setforgotPasswordActiveStage,
  backBtn = true,
  isResetPassword = false,
}) => {
  const tempData = useSelector((state) => state.auth.tempData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [otpStartTime, setOtpStartTime] = useState(Date.now());
  const [resendOtpBtnPressed, setResendOtpBtnPressed] = useState(false);
  const [timer, setTimer] = useState(30);

  // Timer for resend button cooldown
  useEffect(() => {
    let intervalId;
    if (resendOtpBtnPressed) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [resendOtpBtnPressed]);

  useEffect(() => {
    if (timer === 0) {
      setResendOtpBtnPressed(false);
      setTimer(30);
    }
  }, [timer]);

  // Verify OTP mutation
  const { mutate: verifyOtpMutate, isLoading: isVerifyOtpLoading } = useMutation({
    mutationFn: async (otpValue) => {
      if (actionType === "mfa") {
        // MFA verification API
        const response = await axios.post("/api/mfa/verify", {
          token: tempData?.token,
          otp: otpValue,
        });
        return response.data;
      } else {
        // Forgot password verification API
        const response = await axios.post(
          "http://localhost:3000/api/v1/auth/forgetPassword/verify-otp",
          { otp: otpValue, email: email || tempData?.identifier }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      if (actionType === "mfa") {
        notifications.show({
          title: "Success",
          message: "MFA Verified! Redirecting...",
          color: "green",
        });
        // handle MFA signin logic here if needed
      } else {
        if (data.success) {
          notifications.show({
            title: "Success",
            message: "OTP verified! Set your new password",
            color: "green",
          });
          setforgotPasswordActiveStage({
            identifierInput: false,
            otpInput: false,
            passwordInput: true,
          });
        } else {
          notifications.show({
            title: "Error",
            message: "Invalid OTP",
            color: "red",
          });
        }
      }
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
      console.error(error);
    },
  });

  // Resend OTP mutation
  const { mutate: resendOtpMutate, isLoading: isResendOtpLoading } = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/forgetPassword/send-otp",
        {
          identifier: email || tempData?.identifier,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "OTP Resent",
        message: "A new OTP has been sent",
        color: "green",
      });
      setOtpStartTime(Date.now());
      setResendOtpBtnPressed(true);
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: "Failed to resend OTP",
        color: "red",
      });
      console.error(error);
    },
  });

  return (
    <Stack style={{ zIndex: 1, position: "relative" }} align="center">
      <Text c="dimmed" fz="sm">
        An OTP has been sent to your registered email address
      </Text>
      <Text fz={22} align="center">
        Enter OTP
      </Text>

      <Stack justify="center" align="center" style={{ width: "100%" }}>
        <LoadingOverlay visible={isVerifyOtpLoading} zIndex={2} />
        <PinInput
          type="number"
          onComplete={(value) => verifyOtpMutate(value)}
        />
      </Stack>

      <Countdown
        onComplete={() => {
          notifications.show({
            title: "OTP Expired",
            message: "Please resend OTP",
            color: "red",
          });
        }}
        date={new Date(otpStartTime + 1000 * 60 * 5)}
        renderer={({ minutes, seconds }) => (
          <Flex gap={5} align="center">
            <Text fontSize={14} fontWeight={500} style={{ color: COLORS.darkGray }}>
              OTP expires in
            </Text>
            <Text fontWeight="bold" style={{ color: COLORS.blue }}>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </Text>
          </Flex>
        )}
      />

      <Flex gap={10} style={{ width: "100%" }}>
        {backBtn && (
          <Button
            onClick={() => {
              if (isResetPassword) navigate("/");
              else
                setforgotPasswordActiveStage({
                  identifierInput: true,
                  otpInput: false,
                  passwordInput: false,
                });
            }}
            fullWidth
            variant="outline"
            color={hexToRgba(COLORS.secondary)}
            style={{ color: COLORS.secondary }}
          >
            Back
          </Button>
        )}

        <Button
          onClick={() => resendOtpMutate()}
          fullWidth
          loading={isResendOtpLoading}
          disabled={resendOtpBtnPressed}
          color={hexToRgba(resendOtpBtnPressed ? COLORS.white : COLORS.primary)}
        >
          {resendOtpBtnPressed ? timer : "Resend OTP"}
        </Button>
      </Flex>
    </Stack>
  );
};

export default OtpInput;
