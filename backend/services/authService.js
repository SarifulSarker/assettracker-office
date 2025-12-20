import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
//////
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../redis-client.js";
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";
import { generateTokenKey } from "../utils/tokenKeyGenerator.js";

class AuthService {
  async signup(data) {
    const { first_name, last_name, phone, email, password } = data;

    if (!first_name || !last_name || !phone || !email || !password) {
      return {
        success: false,
        status: 400,
        error: "All fields are required",
      };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        success: false,
        status: 400,
        error: "Email is already registered",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    delete user.password;

    return {
      success: true,
      status: 201,
      message: "User registered successfully",
      data: user,
    };
  }

  // ---------------- LOGIN ----------------
  async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      return {
        success: false,
        status: 400,
        error: "All fields are required",
      };
    }

    // find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: false,
        status: 400,
        error: "Invalid email or password",
      };
    }

    // password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        status: 400,
        error: "Invalid email or password",
      };
    }

    // create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1D",
    });

  
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

   
    delete updatedUser.password;
    // Save token in Redis

    const tokenKey = generateTokenKey(user.id); // unique key

    //console.log("this is form login tokenkey ",tokenKey)
    const expiryInSeconds = 24 * 60 * 60; // 1 day

    //console.log("set redis raw token", token);
    await redisClient.set(tokenKey, token, "EX", expiryInSeconds);

    // const mytoken = await redisClient.get(tokenKey);

    return {
      success: true,
      status: 200,
      message: "Login successful",
      token,
      data: updatedUser,
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
