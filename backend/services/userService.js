// services/UserService.js
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

      // Check if email already exists
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

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: first_name,
          lastName: last_name,
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
        message: "User registered successfully",
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

  async getAllUsers({ page, perpage, search }) {
    try {
      let filters = {};

      if (search) {
        const terms = search.trim().split(/\s+/); // split by space

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

      const total = await prisma.user.count({ where: filters });

      console.log({ total });

      const users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
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

  async updateUser(id, data) {
    try {
      const userId = parseInt(id, 10);

      if (!data || Object.keys(data).length === 0) {
        throw new Error("No fields to update");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
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
  async deleteUser(id, req) {
    try {
      if (36 == Number(id)) {
        return {
          success: false,
          status: 400,
          error: "This is SuperAdmin",
        };
      }

      const deletedUser = await prisma.user.delete({
        where: { id: Number(id) },
      });

      return deletedUser;
    } catch (error) {
      if (error.code === "P2025") {
        return null; // record not found
      }
      return {
        success: false,
        status: 500,
        error: error.message || "Server error",
      };
    }
  }

  async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
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
