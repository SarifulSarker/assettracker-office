import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class AssetService {
  // CREATE
  async createAsset(data) {
    try {
      const {
        name,
        brandId,
        specs,
        status,
        notes,
        purchaseDate,
        purchasePrice,
        categoryId,
        subCategoryId,
        vendorId,
      } = data;

      if (!name) {
        return ErrorResponse(400, "Asset name is required");
      }
      const asset = await prisma.asset.create({
        data: {
          name,
          specs,
          status,
          notes,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          purchasePrice: purchasePrice ? Number(purchasePrice) : null,

          brand: brandId ? { connect: { id: Number(brandId) } } : undefined,
          category: categoryId
            ? { connect: { id: Number(categoryId) } }
            : undefined,
          subCategory: subCategoryId
            ? { connect: { id: Number(subCategoryId) } }
            : undefined,
          vendor: vendorId ? { connect: { id: Number(vendorId) } } : undefined,
        },
        include: {
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
      });

      return SuccessResponse(201, "Asset created successfully", asset);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // GET ALL

  async getAllAssets({ page, perpage, search }) {
    try {
      if (!page || !perpage) {
        return ErrorResponse(400, "Page and perpage are required");
      }

      let filters = {};

      // 🔍 Search by asset name
      if (search) {
        const terms = search.trim().split(/\s+/);
        filters = {
          AND: terms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
          })),
        };
      }

      const total = await prisma.asset.count({
        where: filters,
      });

      const assets = await prisma.asset.findMany({
        where: filters,
        include: {
           assetAssingmentEmployees: true,
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perpage,
        take: perpage,
      });
      return SuccessResponse(200, "Assets fetched successfully", {
        assets,
        total,
        page,
        perpage,
      });
    } catch (error) {
      console.error(error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // GET BY ID
  async getAssetById(id) {
    try {
      if (!id) return ErrorResponse(400, "Asset ID is required");

      const asset = await prisma.asset.findFirst({
        where: { id: Number(id) },
        include: {
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
      });

      if (!asset) return ErrorResponse(404, "Asset not found");

      return SuccessResponse(200, "Asset fetched successfully", asset);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // UPDATE
  async updateAsset(id, data) {
    try {
      if (!id) return ErrorResponse(400, "Asset ID is required");

      const asset = await prisma.asset.findFirst({
        where: { id: Number(id) },
      });

      if (!asset) return ErrorResponse(404, "Asset not found");

      const {
        name,
        specs,
        status,
        notes,
        purchaseDate,
        purchasePrice,
        brandId,
        categoryId,
        subCategoryId,
        vendorId,
      } = data;

      const updated = await prisma.asset.update({
        where: { id: Number(id) },
        data: {
          name,
          specs,
          status,
          notes,

          purchaseDate:
            purchaseDate && !isNaN(new Date(purchaseDate))
              ? new Date(purchaseDate)
              : null,

          purchasePrice:
            purchasePrice !== null && purchasePrice !== undefined
              ? Number(purchasePrice)
              : null,

          brand: brandId ? { connect: { id: Number(brandId) } } : undefined,

          category: categoryId
            ? { connect: { id: Number(categoryId) } }
            : undefined,

          subCategory: subCategoryId
            ? { connect: { id: Number(subCategoryId) } }
            : undefined,

          vendor: vendorId ? { connect: { id: Number(vendorId) } } : undefined,
        },
        include: {
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
      });

      return SuccessResponse(200, "Asset updated successfully", updated);
    } catch (error) {
      console.error("UPDATE ASSET ERROR:", error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // DELETE
  async deleteAsset(id) {
    try {
      if (!id) return ErrorResponse(400, "Asset ID is required");

      const asset = await prisma.asset.findFirst({
        where: { id: Number(id) },
      });
      if (!asset) return ErrorResponse(404, "Asset not found");

      await prisma.asset.delete({ where: { id: Number(id) } });

      return SuccessResponse(200, "Asset deleted successfully");
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }
}

export default new AssetService();
