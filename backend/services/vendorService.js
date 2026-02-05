// services/vendorService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";

class vendorService {
  // Create Vendor
  async createVendor(data) {
    try {
      const { name, contact, email, address, notes } = data;

      if (!name) {
        return ErrorResponse(400, "Vendor name is required");
      }

      // Check if vendor already exists by name
      const existingVendor = await prisma.vendor.findFirst({ where: { name } });
      if (existingVendor) {
        return ErrorResponse(400, "Vendor already exists");
      }

      const vendor = await prisma.vendor.create({
        data: {
          name,
          uid: await generateUID(10),
          contact,
          email,
          address,
          notes,
        },
      });

      return SuccessResponse(201, "Vendor created successfully", vendor);
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

  // Get all vendors with pagination + search
  async getAllVendors({ page, perpage, search, status }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let filters = {};

      // Search by name, email, contact (multiple terms)
      if (search) {
        const terms = search.trim().split(/\s+/);

        filters = {
          AND: terms.map((term) => ({
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { contact: { contains: term, mode: "insensitive" } },
            ],
          })),
        };
      }

      // Add status filter if provided (default: active assets only)
      if (status !== undefined) {
        filters.is_active = status;
      } else {
        filters.is_active = true;
      }

      const total = await prisma.vendor.count({ where: filters });

      const vendors = await prisma.vendor.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Vendors fetched successfully", {
        vendors,
        total,
        page,
        perpage,
      });
    } catch (err) {
      return ErrorResponse(500, err.message || "Server Error");
    }
  }

  // Get vendor by ID
  async getVendorById(id) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: Number(id) },
    });

    if (!vendor) {
      return { success: false, status: 404, error: "Vendor not found" };
    }

    return { success: true, status: 200, data: vendor };
  }

  // Update vendor
  async updateVendor(id, data) {
    try {
      const updatedVendor = await prisma.vendor.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          contact: data.contact,
          email: data.email,
          address: data.address,
          notes: data.notes,
        },
      });

      return { success: true, status: 200, data: updatedVendor };
    } catch (error) {
      return { success: false, status: 400, error: error.message };
    }
  }

  // Delete vendor
  async deleteVendor(id) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: Number(id) },
        select: { is_active: true },
      });

      if (!vendor) {
        return { success: false, status: 404, message: "Vendor not found" };
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: Number(id) },
        data: {
          is_active: !vendor.is_active,
        },
      });

      return {
        success: true,
        status: 200,
        data: updatedVendor,
        message: `Vendor ${updatedVendor.is_active ? "activated" : "deactivated"} successfully`,
      };
    } catch (error) {
      return { success: false, status: 400, error: error.message };
    }
  }
}

export default new vendorService();
