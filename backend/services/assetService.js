import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
import { ASSET_LOG_CONTEXT } from "../utils/ASSET_LOG_CONTEXT.js";

const prisma = new PrismaClient();

class AssetService {
  // CREATE
  async createAsset(data, issuer) {
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
          uid: await generateUID(10),
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

      // 2️⃣ Create log (inline, no transaction)
      const dt = await prisma.assetLog.create({
        data: {
          asset_id: asset.id,
          context: ASSET_LOG_CONTEXT.CREATE,
          description: `Asset created by ${issuer.firstName || "system"}`,
          issuer: issuer?.firstName || "system",
        },
      });
      // console.log(dt)
      return SuccessResponse(201, "Asset created successfully", asset);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // GET ALL

  async getAllAssets({ page, perpage, search, status, issuer }) {
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

      // Add status filter if provided (default: active assets only)
      if (status !== undefined) {
        filters.is_active = status;
      } else {
        filters.is_active = true;
      }

      const total = await prisma.asset.count({ where: filters });

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

      // console.log(`assets has been fetched by ${issuer.firstName}`);
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
  async getAssetById(uid) {
    try {
      if (!uid) return ErrorResponse(400, "Asset ID is required");

      const asset = await prisma.asset.findFirst({
        where: { uid: uid },
        include: {
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
          assetLogs: {
            orderBy: { createdAt: "desc" }, // latest first
          },
        },
      });

      if (!asset) return ErrorResponse(404, "Asset not found");

      return SuccessResponse(200, "Asset fetched by uuid successfully", asset);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // UPDATE
async updateAsset(uid, payload, issuer) {
  try {
    if (!uid) return ErrorResponse(400, "Asset UID is required");

    /* ---------------- 1️⃣ Fetch old asset with all relations ---------------- */
    const oldAsset = await prisma.asset.findUnique({
      where: { uid },
      include: {
        brand: true,
        category: true,
        subCategory: true,
        vendor: true,
      },
    });

    if (!oldAsset) return ErrorResponse(404, "Asset not found");

    /* ---------------- 2️⃣ Build updateData dynamically ---------------- */
    const updateData = {};
    const changedFields = {};

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;

      /* ---------- relation fields (xxxId) ---------- */
      if (key.endsWith("Id")) {
        const relationKey = key.replace("Id", "");
        const oldRelation = oldAsset[relationKey];
        const newId = Number(value);

        if (!newId || oldRelation?.id === newId) continue;

        const newEntity = await prisma[relationKey].findUnique({
          where: { id: newId },
          select: { name: true },
        });

        changedFields[relationKey] = {
          from: oldRelation?.name || "N/A",
          to: newEntity?.name || "N/A",
        };

        updateData[relationKey] = {
          connect: { id: newId },
        };

        continue;
      }

      /* ---------- date fields ---------- */
      if (oldAsset[key] instanceof Date || key.toLowerCase().includes("date")) {
        const oldDate = oldAsset[key]
          ? new Date(oldAsset[key]).toISOString()
          : null;

        const newDate = value ? new Date(value).toISOString() : null;

        if (oldDate !== newDate) {
          changedFields[key] = {
            from: oldAsset[key],
            to: value,
          };
          updateData[key] = new Date(value);
        }
        continue;
      }

      /* ---------- scalar fields ---------- */
      if (oldAsset[key] !== value) {
        changedFields[key] = {
          from: oldAsset[key],
          to: value,
        };
        updateData[key] = value;
      }
    }

    /* ---------------- 3️⃣ Update asset ---------------- */
    const updatedAsset = await prisma.asset.update({
      where: { uid },
      data: updateData,
      include: {
        brand: true,
        category: true,
        subCategory: true,
        vendor: true,
      },
    });

    /* ---------------- 4️⃣ Save log ---------------- */
    if (Object.keys(changedFields).length > 0) {
      await prisma.assetLog.create({
        data: {
          asset_id: updatedAsset.id,
          context: ASSET_LOG_CONTEXT.UPDATE,
          description: `Updated fields: ${JSON.stringify(changedFields)}`,
          issuer: issuer?.firstName || "system",
        },
      });
    }

    return SuccessResponse(200, "Asset updated successfully", updatedAsset);
  } catch (error) {
    console.error("UPDATE ASSET ERROR:", error);
    return ErrorResponse(500, error.message || "Server Error");
  }
}


  // DELETE
  async deleteAsset(uid, issuer) {
    try {
      if (!uid) return ErrorResponse(400, "Asset ID is required");

      const asset = await prisma.asset.findFirst({
        where: { uid: uid },
      });
      if (!asset) return ErrorResponse(404, "Asset not found");

      const updatedAsset = await prisma.asset.update({
        where: { uid: uid },
        data: {
          is_active: false,
        },
      });

      // 3️⃣ Create log
      const dt = await prisma.assetLog.create({
        data: {
          asset_id: updatedAsset.id,
          context: ASSET_LOG_CONTEXT.DELETE, // or ASSET_LOG_CONTEXT.DEACTIVATE
          description: `${updatedAsset.name} Asset Delete by ${
            issuer?.firstName || "system"
          }`,
          issuer: issuer?.firstName || "system",
        },
      });
      console.log(dt);

      return SuccessResponse(200, "Asset deleted successfully");
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }
}

export default new AssetService();
