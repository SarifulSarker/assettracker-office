import httpRequest from "../helpers/httpRequest.js"; // adjust path if needed

const BASE_URL = "/auth";
// Sign in
export const signInApi = async (data) => {
  try {
    const response = await httpRequest.post(`${BASE_URL}/signin`, data);
    return response;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

//sign up

export const signUpApi = async (formData) => {
  try {
    const response = await httpRequest.post(`${BASE_URL}/signup`, formData);
    return response;
  } catch (error) {
    console.error("Error signing up:", error.response || error);
    throw error; // keep throwing for react-query to handle
  }
};

export const SignOutApi = async () => {
  const response = await axios.post(
    "(http://192.168.0.117:5000/api/v1/auth/logout)",
    {
      withCredentials: true, // if using cookies
    },
  );
  return response.data;
};

// Check email & send OTP
export const checkEmailApi = async (email) => {
  const response = await httpRequest.post(
    `${BASE_URL}/check-email`,
    { email },
    { withCredentials: true },
  );
  return response;
};

// ===== Verify OTP =====
export const verifyMfaOtpApi = async ({ token, otp }) => {
  const response = await httpRequest.post("/api/mfa/verify", {
    token,
    otp,
  });
  return response;
};

export const verifyForgotPasswordOtpApi = async ({ otp, email }) => {
  const response = await httpRequest.post(
    `${BASE_URL}/forgetPassword/verify-otp`,
    {
      otp,
      email,
    },
  );
  return response;
};

// ===== Resend OTP =====
export const resendForgotPasswordOtpApi = async (identifier) => {
  const response = await httpRequest.post(
    `${BASE_URL}/forgetPassword/send-otp`,
    {
      identifier,
    },
  );
  return response;
};

// src/api/authApis.js

export const resetPasswordApi = async ({ email, newPassword }) => {
  const response = await httpRequest.post(`${BASE_URL}/reset-password`, {
    email,
    newPassword,
  });
  return response;
};
