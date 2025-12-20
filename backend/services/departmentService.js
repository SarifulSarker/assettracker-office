// services/departmentService.js
import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class departmentService {
  // Create Department
  async createDepartment(data) {
    try {
      const { name } = data;

      if (!name) {
        return ErrorResponse(400, "Department name is required");
      }

      // Check duplicate
      const exists = await prisma.department.findFirst({ where: { name } });

      if (exists) {
        return ErrorResponse(400, "Department already exists");
      }

      const dept = await prisma.department.create({ data: { name } });

      return SuccessResponse(201, "Department created successfully", dept);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server error");
    }
  }

  // Get all departments
  async getAllDepartments({ page, perpage, search }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let filters = {};

      if (search) {
        const terms = search.trim().split(/\s+/);
        filters = {
          AND: terms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
          })),
        };
      }

      const total = await prisma.department.count({ where: filters });

      const departments = await prisma.department.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Departments fetched successfully", {
        departments,
        total,
        page,
        perpage,
      });
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // Get single department
  async getDepartmentById(id) {
    try {
      const dept = await prisma.department.findUnique({ where: { id: Number(id) } });

      if (!dept) {
        return ErrorResponse(404, "Department not found");
      }

      return SuccessResponse(200, "Department fetched successfully", dept);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server error");
    }
  }

  // Update department
  async updateDepartment(id, data) {
    try {
      const updated = await prisma.department.update({
        where: { id: Number(id) },
        data,
      });

      return SuccessResponse(200, "Department updated successfully", updated);
    } catch (error) {
      if (error.code === "P2025") {
        return ErrorResponse(404, "Department not found");
      }
      return ErrorResponse(500, error.message || "Server error");
    }
  }

  // Delete department
  async deleteDepartment(id) {
    try {
      const deleted = await prisma.department.delete({ where: { id: Number(id) } });

      return SuccessResponse(200, "Department deleted successfully", deleted);
    } catch (error) {
      if (error.code === "P2025") {
        return ErrorResponse(404, "Department not found");
      }
      return ErrorResponse(500, error.message || "Server error");
    }
  }
}

export default new departmentService();
