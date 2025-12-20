import {
  Button,
  Divider,
  Flex,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import IdentifierInput from "../../Pages/Auth/IdentifierInput";
import NewPasswordInput from "../../Pages/Auth/NewPasswordInput";
import OtpInput from "../../Pages/Auth/OtpInput";
import { hexToRgba } from "../../utils/utils";
import COLORS from "../../constants/Colors";

const ForgotPassword = () => {
  const navigate = useNavigate();


  const [forgotPasswordActiveStage, setforgotPasswordActiveStage] = useState({
    identifierInput: true,
    otpInput: false,
    passwordInput: false,
  });

  return (
    <Stack
      align="center"
      justify="center"
      style={{
        height: "100vh",
      }}
    >
      <Paper
        p="lg"
        radius="xs"
        shadow="sm"
        style={{
          minHeight: 400,
          minWidth: 310,
        }}
      >
        <Stack
          py="md"
          style={{
            height: "100%",
            width: 310,
          }}
        >
          <Title align="center" order={2}>
            Reset Password
          </Title>
          <Divider />
          <Stack
            justify="center"
            style={{
              height: "100%",
            }}
          >
            {forgotPasswordActiveStage.identifierInput && (
              <IdentifierInput
                setforgotPasswordActiveStage={setforgotPasswordActiveStage}
              />
            )}
            {forgotPasswordActiveStage.otpInput && (
              <OtpInput
                setforgotPasswordActiveStage={setforgotPasswordActiveStage}
              />
            )}
            {forgotPasswordActiveStage.passwordInput && (
              <NewPasswordInput
                setforgotPasswordActiveStage={setforgotPasswordActiveStage}
              />
            )}
          </Stack>
          <Flex justify="center" gap={10}>
            <Text c="dimmed">Sign in again?</Text>
            <Button
              onClick={() => {
                navigate("/");
              }}
              variant="subtle"
              size="compact-sm"
              color={hexToRgba(COLORS.accent)}
            >
              Click here
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ForgotPassword;
