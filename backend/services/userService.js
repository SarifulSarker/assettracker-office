// services/UserService.js
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { generateUID } from "../utils/uuid.js";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

class userService {
  // create user
  async createUser(data) {
    try {
      const { first_name, last_name, phone, email } = data;

      // 1️⃣ Required field check
      if (!first_name || !last_name || !phone || !email) {
        return ErrorResponse(Number(400), "All fields are required");
      }

      // 2️⃣ Email domain validation
      const allowedDomain = "@manush.tech";
      if (!email.toLowerCase().endsWith(allowedDomain)) {
        return ErrorResponse(Number(400), "Invalid Email");
      }

      // 4️⃣ Default password
      const defaultPassword = "User@123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // 5️⃣ Create user
      const user = await prisma.user.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          uid: await generateUID(10),
          phone,
          email,
          password: hashedPassword,
        },
      });

      // 6️⃣ Remove password
      delete user.password;

      return SuccessResponse(Number(201), "User registered successfully", user);
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

  // services/userService.js

  async getAllUsers({ page, perpage, search, status }) {
    try {
      let filters = {};

      if (search) {
        const terms = search.trim().split(/\s+/);

        filters = {
          AND: terms.map((term) => ({
            OR: [
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          })),
        };
      }

      // Add status filter if defined, default: active users only
      if (status !== undefined) {
        filters.is_active = status;
      } else {
        filters.is_active = true; // default active
      }

      const total = await prisma.user.count({ where: filters });

      const users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          uid: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          is_active: true,

          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return {
        success: true,
        status: 200,
        data: { users, total, page, perpage },
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        data: { error: error.message || "Server Error" },
      };
    }
  }

  async updateUser(uid, data) {
    try {
      // 1️⃣ Email domain validation (only if email exists)
      if (data.email) {
        const allowedDomain = "@manush.tech";
        if (!data.email.toLowerCase().endsWith(allowedDomain)) {
          return ErrorResponse(400, "Invalid email domain");
        }
      }

      // 2️⃣ Prepare update payload
      const updatePayload = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
      };

      // 3️⃣ roleId optional (nullable support)
      if (data.roleId !== undefined) {
        updatePayload.roleId =
          data.roleId === null ? null : Number(data.roleId);
      }

      // 4️⃣ Update user
      const updatedUser = await prisma.user.update({
        where: { uid },
        data: updatePayload,
        include: {
          roleInfo: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      // 5️⃣ Remove sensitive fields
      delete updatedUser.password;

      return SuccessResponse(200, "User updated successfully", updatedUser);
    } catch (error) {
      console.error("Update user service error:", error);

      // Unique constraint
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        return ErrorResponse(409, `${field} already exists`);
      }

      // Foreign key constraint (invalid roleId)
      if (error.code === "P2003") {
        return ErrorResponse(400, "Invalid role selected");
      }

      return ErrorResponse(500, error.message || "Server error");
    }
  }

  // delete user by id
  async deleteUser(uid, req) {
    try {
      // 1️⃣ Find user first
      const user = await prisma.user.findUnique({
        where: { uid },
        select: { is_active: true },
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      // 2️⃣ Toggle is_active
      const updatedUser = await prisma.user.update({
        where: { uid },
        data: {
          is_active: !user.is_active,
        },
      });

      return {
        success: true,
        status: 200,
        data: updatedUser,
        message: `User ${
          updatedUser.is_active ? "activated" : "deactivated"
        } successfully`,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: error.message || "Server error",
      };
    }
  }

  async getUserById(uid) {
    try {
      const user = await prisma.user.findUnique({
        where: { uid: uid },
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          error: "User not found",
        };
      }

      delete user.password;

      return {
        success: true,
        status: 200,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: error.message || "Server error",
      };
    }
  }
}

export default new userService();
