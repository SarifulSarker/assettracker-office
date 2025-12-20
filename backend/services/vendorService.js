// services/vendorService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

class vendorService {
  // Create Vendor
  async createVendor(data) {
    const { name, contact, email, address, notes } = data;
    if (!name) {
      return { success: false, status: 400, error: "Vendor name is required" };
    }

    // Check if vendor already exists by name
    const existingVendor = await prisma.vendor.findFirst({ where: { name } });
    if (existingVendor) {
      return { success: false, status: 400, error: "Vendor already exists" };
    }

    const vendor = await prisma.vendor.create({
      data: { name, contact, email, address, notes },
    });

    return {
      success: true,
      status: 201,
      message: "Vendor created successfully",
      data: vendor,
    };
  }

  // Get all vendors
 // Get all vendors with pagination + search
async getAllVendors({ page, perpage, search }) {
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
      const deletedVendor = await prisma.vendor.delete({
        where: { id: Number(id) },
      });
      return { success: true, status: 200, data: deletedVendor };
    } catch (error) {
      return { success: false, status: 400, error: error.message };
    }
  }
}

export default new vendorService();
