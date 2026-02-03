import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { SuccessResponse, ErrorResponse } from "../utils/return.js";

class RoleAndPermissionService {
  async createRole(data) {
    try {
      const { role, permissions } = data;

      if (!role) return ErrorResponse(400, "Role name is required");

      const existingRole = await prisma.roles.findUnique({ where: { role } });
      if (existingRole) return ErrorResponse(400, "Role already exists");

      const newRole = await prisma.roles.create({
        data: {
          role,
          permission: {
            create: {
              modules: permissions, // JSON object
            },
          },
        },
        include: {
          permission: true,
        },
      });

      return SuccessResponse(201, "Role created successfully", newRole);
    } catch (error) {
      console.error("Create Role Error:", error);
      return ErrorResponse(500, "Internal server error");
    }
  }

  async getAllRoles({ page, perpage, search }) {
    try {
      let filters = {};

      if (search) {
        const terms = search.trim().split(/\s+/);
        filters = {
          AND: terms.map((term) => ({
            OR: [{ role: { contains: term, mode: "insensitive" } }],
          })),
        };
      }

      const total = await prisma.roles.count({ where: filters });

      const roles = await prisma.roles.findMany({
        where: filters,
        select: {
          id: true,
          role: true,
          permission: {
            select: {
              id: true,
              modules: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Roles fetched successfully", {
        roles,
        total,
        page,
        perpage,
      });
    } catch (error) {
      console.error(error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }


  async updateRole(id, data) {
  try {
    const { role, permissions } = data;

    if (!id) return ErrorResponse(400, "Role id is required");

    const existingRole = await prisma.roles.findUnique({
      where: { id },
      include: { permission: true },
    });

    if (!existingRole)
      return ErrorResponse(404, "Role not found");

    // 🔁 role name duplicate check (except itself)
    if (role && role !== existingRole.role) {
      const duplicate = await prisma.roles.findFirst({
        where: {
          role,
          NOT: { id },
        },
      });

      if (duplicate)
        return ErrorResponse(400, "Role already exists");
    }

    const updatedRole = await prisma.roles.update({
      where: { id },
      data: {
        role: role ?? existingRole.role,
        permission: permissions
          ? {
              update: {
                modules: permissions, // full JSON replace
              },
            }
          : undefined,
      },
      include: {
        permission: true,
      },
    });

    return SuccessResponse(
      200,
      "Role updated successfully",
      updatedRole
    );
  } catch (error) {
    console.error("Update Role Error:", error);
    return ErrorResponse(500, "Internal server error");
  }
}




}

export default new RoleAndPermissionService();
