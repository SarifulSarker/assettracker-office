// services/BrandService.js
import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class BrandService {
  async getAllBrands({ page, perpage, search }) {
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

      const brand = await prisma.brand.create({ data: { name } });

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
        data: { name : data.name, },
      });

      return SuccessResponse(200, "Brand updated successfully", brand);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async deleteBrand(id) {
    try {
      if (!id) return ErrorResponse(400, "Brand ID is required");

      await prisma.brand.delete({ where: { id: Number(id) } });

      return SuccessResponse(200, "Brand deleted successfully");
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
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
