import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
const prisma = new PrismaClient();

class DesignationService {
  // CREATE
  async createDesignation(data) {
    try {
      const { name, description, is_active } = data;

      if (!name) {
        return ErrorResponse(400, "Designation name is required");
      }

      // check duplicate name
      const exists = await prisma.designation.findFirst({
        where: { name },
      });

      if (exists) {
        return ErrorResponse(400, "Designation already exists");
      }

      const designation = await prisma.designation.create({
        data: {
          name,
          uid: await generateUID(10),
          description,
          is_active: is_active ?? true,
        },
      });

      return SuccessResponse(
        201,
        "Designation created successfully",
        designation
      );
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // GET ALL (pagination + search)
  async getDesignations({ page, perpage, search, status }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let where = {};

      // Search filter
      if (search) {
        const terms = search.trim().split(/\s+/);
        where = {
          AND: terms.map((term) => ({
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          })),
        };
      }

      // Convert status string to boolean
      if (status !== undefined) {
        if (typeof status === "string") {
          where.is_active = status === "true"; // convert "true"/"false" to boolean
        } else {
          where.is_active = status; // already boolean
        }
      } else {
        where.is_active = true; // default active
      }

      const total = await prisma.designation.count({ where });

      const designations = await prisma.designation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Designations fetched successfully", {
        designations,
        total,
        page,
        perpage,
      });
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // GET BY ID
  async getDesignationById(id) {
    try {
      const designation = await prisma.designation.findUnique({
        where: { id: Number(id) },
      });

      if (!designation) {
        return ErrorResponse(404, "Designation not found");
      }

      return SuccessResponse(
        200,
        "Designation fetched successfully",
        designation
      );
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // UPDATE
  async updateDesignation(id, data) {
    try {
      const designation = await prisma.designation.findUnique({
        where: { id: Number(id) },
      });

      if (!designation) {
        return ErrorResponse(404, "Designation not found");
      }

      // prevent duplicate name
      if (data.name) {
        const exists = await prisma.designation.findFirst({
          where: {
            name: data.name,
            NOT: { id: Number(id) },
          },
        });

        if (exists) {
          return ErrorResponse(400, "Designation name already exists");
        }
      }

      const updatedDesignation = await prisma.designation.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      return SuccessResponse(
        200,
        "Designation updated successfully",
        updatedDesignation
      );
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // DELETE
  async deleteDesignation(id) {
    try {
      if (!id) {
        return ErrorResponse(400, "Designation ID is required");
      }

      const designation = await prisma.designation.findUnique({
        where: { id: Number(id) },
        select: { is_active: true },
      });

      if (!designation) {
        return ErrorResponse(404, "Designation not found");
      }

      const updatedDesignation = await prisma.designation.update({
        where: { id: Number(id) },
        data: {
          is_active: !designation.is_active,
        },
      });

      return SuccessResponse(
        200,
        `Designation ${
          updatedDesignation.is_active ? "activated" : "deactivated"
        } successfully`,
        updatedDesignation
      );
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }
}

export default new DesignationService();
