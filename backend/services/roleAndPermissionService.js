import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { SuccessResponse, ErrorResponse } from "../utils/return.js";

class RoleAndPermissionService {
  async createRole(data) {
    try {
      const { role,  permissions } = data;

      // validation
      if (!role) {
        return ErrorResponse(400, "Role name is required");
      }

      // duplicate role check
      const existingRole = await prisma.roles.findUnique({
        where: { role },
      });

      if (existingRole) {
        return ErrorResponse(400, "Role already exists");
      }

      // transaction: role + permission
      const newRole = await prisma.$transaction(async (tx) => {
        const createdRole = await tx.roles.create({
          data: {
            role,
            
          },
        });

        if (permissions) {
          await tx.permission.create({
            data: {
              roleId: createdRole.id,
              modules: permissions,
            },
          });
        }

        return createdRole;
      });

      return SuccessResponse(
        201,
        "Role created successfully",
        newRole
      );
    } catch (error) {
      console.error("Create Role Error:", error);
      return ErrorResponse(500, "Internal server error");
    }
  }
}

export default new RoleAndPermissionService();
