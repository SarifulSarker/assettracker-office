// services/BrandService.js
import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
const prisma = new PrismaClient();

class BrandService {
  // brandService.js
  async getAllBrands({ page, perpage, search, status }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let filters = {};

      // 🔍 Search by brand name
      if (search) {
        const terms = search.trim().split(/\s+/);
        filters.AND = terms.map((term) => ({
          name: { contains: term, mode: "insensitive" },
        }));
      }

      // ✅ Status filter
      if (status !== undefined) {
        filters.is_active = status;
      } else {
        filters.is_active = true;
      }

      const total = await prisma.brand.count({ where: filters });

      const brands = await prisma.brand.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });

      return SuccessResponse(200, "Brands fetched successfully", {
        brands,
        total,
        page,
        perpage,
      });
    } catch (error) {
      console.error(error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async createBrand({ name }) {
    try {
      if (!name) return ErrorResponse(400, "Brand name is required");

      const existingBrand = await prisma.brand.findUnique({ where: { name } });

      if (existingBrand) {
        return ErrorResponse(400, "Brand name already exists");
      }

      const brand = await prisma.brand.create({
        data: { name, uid: await generateUID(10) },
      });

      return SuccessResponse(201, "Brand created successfully", brand);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async updateBrand(id, data) {
    try {
      if (!id) return ErrorResponse(400, "Brand ID is required");
      if (!data.name) return ErrorResponse(400, "Brand name is required");

      const brand = await prisma.brand.update({
        where: { id: Number(id) },
        data: { name: data.name },
      });

      return SuccessResponse(200, "Brand updated successfully", brand);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async deleteBrand(id) {
    try {
      if (!id) {
        return { success: false, status: 400, message: "Brand ID is required" };
      }

      const brand = await prisma.brand.findUnique({
        where: { id: Number(id) },
        select: { is_active: true },
      });

      if (!brand) {
        return { success: false, status: 404, message: "Brand not found" };
      }

      const updatedBrand = await prisma.brand.update({
        where: { id: Number(id) },
        data: {
          is_active: !brand.is_active,
        },
      });

      return SuccessResponse(
        200,
        `Brand ${
          updatedBrand.is_active ? "activated" : "deactivated"
        } successfully`,
        updatedBrand,
      );
    } catch (error) {
      return {
        success: false,
        status: 400,
        error: error.message || "Server Error",
      };
    }
  }

  async getBrandById(id) {
    try {
      if (!id) return ErrorResponse(400, "Brand ID is required");

      const brand = await prisma.brand.findUnique({
        where: { id: Number(id) },
      });

      if (!brand) return ErrorResponse(404, "Brand not found");

      return SuccessResponse(200, "Brand fetched successfully", brand);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }
}

export default new BrandService();
