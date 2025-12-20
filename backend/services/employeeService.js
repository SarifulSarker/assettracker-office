import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class EmployeeService {
  // CREATE
  async createEmployee(data) {
    try {
      const {
        fullName,
        email,
        phone,
        departmentId,
        designationId,
        status,
        is_active,
      } = data;

      // check existing employee
      const exists = await prisma.employee.findUnique({
        where: { email },
      });

      if (exists) {
        return ErrorResponse(400, "Employee already exists");
      }

      const employee = await prisma.employee.create({
        data: {
          fullName,
          email,
          phone,
          status: status || "active",
          is_active: is_active ?? true,
          departmentId: departmentId ? Number(departmentId) : null,
          designationId: designationId ? Number(designationId) : null,
        },
        include: {
          department: true,
          designation: true,
        },
      });

      return SuccessResponse(201, "Employee created successfully", employee);
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // LIST WITH PAGINATION + SEARCH
  async getEmployees({ page, perpage, search }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let where = {};

      if (search) {
        const terms = search.trim().split(/\s+/);

        where = {
          AND: terms.map((term) => ({
            OR: [
              { fullName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { phone: { contains: term, mode: "insensitive" } },
              {
                designation: {
                  name: { contains: term, mode: "insensitive" },
                },
              },
              {
                department: {
                  name: { contains: term, mode: "insensitive" },
                },
              },
            ],
          })),
        };
      }

      const total = await prisma.employee.count({ where });

      const employees = await prisma.employee.findMany({
        where,
        include: {
          department: true,
          designation: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Employees fetched successfully", {
        employees,
        total,
        page,
        perpage,
      });
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // GET BY ID
  async getEmployeeById(id) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: Number(id) },
        include: {
          department: true,
          designation: true,
        },
      });

      if (!employee) {
        return ErrorResponse(404, "Employee not found");
      }

      return SuccessResponse(200, "Employee fetched successfully", employee);
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // UPDATE
  async updateEmployee(id, data) {
    try {
      const exists = await prisma.employee.findUnique({
        where: { id: Number(id) },
      });

      if (!exists) {
        return ErrorResponse(404, "Employee not found");
      }

      const updatedEmployee = await prisma.employee.update({
        where: { id: Number(id) },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          status: data.status,
          is_active: data.is_active,
          departmentId: data.departmentId ? Number(data.departmentId) : null,
          designationId: data.designationId ? Number(data.designationId) : null,
        },
        include: {
          department: true,
          designation: true,
        },
      });

      return SuccessResponse(
        200,
        "Employee updated successfully",
        updatedEmployee
      );
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // DELETE
  async deleteEmployee(id) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: Number(id) },
      });

      if (!employee) {
        return ErrorResponse(404, "Employee not found");
      }

      await prisma.employee.delete({
        where: { id: Number(id) },
      });

      return SuccessResponse(200, "Employee deleted successfully");
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }
}

export default new EmployeeService();
