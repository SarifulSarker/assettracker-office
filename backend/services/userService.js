// services/UserService.js
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { generateUID } from "../utils/uuid.js";
class userService {
  // create user
  async createUser(data) {
    try {
      const { first_name, last_name, phone, email } = data;

      if (!first_name || !last_name || !phone || !email) {
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

      // Set default password
      const defaultPassword = "12345";

      // Hash the password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const uuid = await generateUID(10);
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          uid: uuid,
          phone,
          email,
          password: hashedPassword,
        },
      });

      // Remove password from response
      delete user.password;

      return {
        success: true,
        status: 201,
        message: "User registered successfully back",
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
          token: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { id: "asc" },
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
      //  const userId = parseInt(id, 10);

      if (!data || Object.keys(data).length === 0) {
        throw new Error("No fields to update");
      }

      const updatedUser = await prisma.user.update({
        where: { uid: uid },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
      });

      return updatedUser;
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: error.message || "Server error",
      };
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
