import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../redis-client.js";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

import { generateTokenKey } from "../utils/tokenKeyGenerator.js";
import { generateUID } from "../utils/uuid.js";

class AuthService {
  async signup(data) {
    const { first_name, last_name, phone, email, password } = data;

    // 1️⃣ Required fields check
    if (!first_name || !last_name || !phone || !email || !password) {
      return ErrorResponse(400, "All fields are required");
    }

    // 2️⃣ Email domain check
    const allowedDomain = "@manush.tech";
    if (!email.toLowerCase().endsWith(allowedDomain)) {
      return ErrorResponse(400, "Email Not Valid");
    }

    try {
      // 4️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5️⃣ Create user
      const user = await prisma.user.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          uid: await generateUID(10),
          email,
          phone,
          password: hashedPassword,
        },
      });

      // 6️⃣ Remove password from response
      delete user.password;

      // 7️⃣ Return success response
      return SuccessResponse(201, "User registered successfully", user);
    } catch (error) {
      console.log(error);
      // Prisma unique constraint error
      if (error.code === "P2002") {
        const field = error.meta?.target || "field";

        return ErrorResponse(409, `${field} already exists`);
      }

      return ErrorResponse(500, "Internal server error");
    }
  }

  // ---------------- LOGIN ----------------
  async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      return { success: false, status: 400, error: "All fields are required" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roleInfo: { include: { permission: true } },
      },
    });

    if (!user)
      return {
        success: false,
        status: 400,
        error: "Invalid email or password",
      };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return { success: false, status: 400, error: "Invalid password" };

    const tokenPayload = {
      userId: user.id,
      role: user.roleInfo?.role || "NoRole",
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1D",
    });

    // Save token in Redis
    const tokenKey = generateTokenKey(user.id);
    await redisClient.set(tokenKey, token, "EX", 24 * 60 * 60);

    delete user.password;

    return {
      success: true,
      status: 200,
      message: "Login successful",
      token,
      data: {
        ...user,
        role: user.roleInfo?.role || "NoRole", // ✅ safe
        permissions: user.roleInfo?.permission?.modules || {}, // ✅ safe
      },
    };
  }

  // ---------------- LOGOUT ----------------
  async logout() {
    return {
      success: true,
      status: 200,
      message: "Logged out successfully",
    };
  }

  //for forget password
  async checkEmail(email) {
    if (!email) {
      return { exists: false, message: "Email is required" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return { exists: true };
    } else {
      return { exists: false };
    }
  }

  //verify otp
  async verifyOTP(otp) {
    if (!otp) {
      return { success: false, message: "Email and OTP are required" };
    }

    const SystemOTP = "9999";

    if (SystemOTP === otp) {
      return { success: true, message: "OTP verified" };
    } else {
      return { success: false, message: "Invalid OTP" };
    }
  }

  //set new password
  // Reset password logic
  async resetPassword(Email, newPassword) {
    if (!newPassword) {
      return { success: false, message: "Email and new password are required" };
    }
    console.log("email forn service", Email.identifier);
    const email = Email.identifier;
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update password (hash in real app!)
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: "Password reset successfully" };
  }
}

export default new AuthService(); // Singleton instance
