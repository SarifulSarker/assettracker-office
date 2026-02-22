import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateAssetUID, generateUID } from "../utils/uuid.js";
import { ASSET_LOG_CONTEXT } from "../utils/ASSET_LOG_CONTEXT.js";

const prisma = new PrismaClient();

class AssetService {
  // CREATE
  async createAsset(data, files, issuer) {
    try {
      const {
        name,
        units,
        productIds = [],
        unitPrices = [], // 🆕 NEW ARRAY (unit wise price)
        brandId,
        specs,
        notes,
        purchaseDate,
        categoryId,
        subCategoryId,
        vendorId,
      } = data;

      if (!name) {
        return ErrorResponse(400, "Asset name is required");
      }

      // 🔒 Validation
      if (productIds.length !== Number(units)) {
        return ErrorResponse(400, "Units and productIds length mismatch");
      }

      if (unitPrices.length > 0 && unitPrices.length !== productIds.length) {
        return ErrorResponse(400, "Each unit must have a price");
      }

      // ✅ image paths
      const imagePaths = files?.length
        ? files.map((file) => `/uploads/assets/${file.filename}`)
        : [];

      // -------------------- CREATE ASSET --------------------
      const asset = await prisma.asset.create({
        data: {
          name,
          uid: generateAssetUID(new Date()),
          specs,
          notes,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          units: Number(units),
          images: imagePaths,

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

      // -------------------- CREATE ASSET UNITS WITH PRICE 🆕 --------------------
      const assetUnitData = productIds.map((pid, index) => ({
        assetId: asset.id,
        productId: pid,
        status: "IN_STOCK",
        purchasePrice: unitPrices[index] ? Number(unitPrices[index]) : null,
      }));

      await prisma.assetUnit.createMany({
        data: assetUnitData,
        skipDuplicates: true,
      });

      // -------------------- ASSET LOG --------------------
      await prisma.assetLog.create({
        data: {
          asset_id: asset.id,
          asset_uid: asset.uid,
          context: ASSET_LOG_CONTEXT.CREATE,
          description: `Asset created by ${issuer?.firstName || "system"}`,
          issuer: issuer?.firstName || "system",
        },
      });

      return SuccessResponse(
        201,
        "Asset created successfully with unit prices",
        asset,
      );
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
      // 🔍 Search by asset name OR assigned employee name
      if (search) {
        const terms = search.trim().split(/\s+/);
        filters = {
          AND: terms.map((term) => ({
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              {
                assetAssingmentEmployees: {
                  some: {
                    unassignedAt: null, // only currently assigned
                    employee: {
                      fullName: { contains: term, mode: "insensitive" },
                    },
                  },
                },
              },
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

      const total = await prisma.asset.count({ where: filters });

      const assets = await prisma.asset.findMany({
        where: filters,
        include: {
          assetAssingmentEmployees: {
            where: {
              unassignedAt: null, // ✅ only current assigned employee
            },
            include: {
              employee: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
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
          assetUnits: true,
        },
      });

      if (!asset) return ErrorResponse(404, "Asset not found");

      return SuccessResponse(200, "Asset fetched by uuid successfully", asset);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // UPDATE
async updateAsset(uid, payload, issuer, files) {
  try {
    if (!uid) return ErrorResponse(400, "Asset UID is required");

    /* ---------------- 1️⃣ Convert FormData ---------------- */
    if (payload instanceof FormData) {
      const obj = {};

      for (const [key, value] of payload.entries()) {
        if (key.endsWith("[]")) {
          const realKey = key.replace("[]", "");
          obj[realKey] = obj[realKey] || [];
          obj[realKey].push(value);
        } else {
          obj[key] = value;
        }
      }

      payload = obj;
    }

    /* ---------------- 2️⃣ Type Conversion ---------------- */
    if (payload.units !== undefined) {
      payload.units = Number(payload.units);
    }

    if (payload.unitPrices) {
      payload.unitPrices = payload.unitPrices.map((p) => Number(p));
    }

    /* ---------------- 3️⃣ Fetch Existing Asset ---------------- */
    const oldAsset = await prisma.asset.findUnique({
      where: { uid },
      include: {
        brand: true,
        category: true,
        subCategory: true,
        vendor: true,
        assetUnits: true,
      },
    });

    if (!oldAsset) return ErrorResponse(404, "Asset not found");

    /* ---------------- 4️⃣ Build Update Data ---------------- */
    const relationModelMap = {
      brand: prisma.brand,
      category: prisma.category,
      subCategory: prisma.category,
      vendor: prisma.vendor,
    };

    const skipFields = [
      "existingImages",
      "productIds",
      "unitPrices",
    ];

    const updateData = {};
    const changedFields = {};

    for (const [key, value] of Object.entries(payload)) {
      if (skipFields.includes(key)) continue;
      if (value === undefined || value === null) continue;

      /* ---------- Relation Fields ---------- */
      if (key.endsWith("Id")) {
        const relationKey = key.replace("Id", "");
        const newId = Number(value);
        const oldRelation = oldAsset[relationKey];

        if (!newId || oldRelation?.id === newId) continue;

        const model = relationModelMap[relationKey];
        if (!model) continue;

        const newEntity = await model.findUnique({
          where: { id: newId },
          select: { name: true },
        });

        updateData[relationKey] = { connect: { id: newId } };

        changedFields[relationKey] = {
          from: oldRelation?.name || "N/A",
          to: newEntity?.name || "N/A",
        };

        continue;
      }

      /* ---------- Date Fields ---------- */
      if (
        oldAsset[key] instanceof Date ||
        key.toLowerCase().includes("date")
      ) {
        const newDate = value ? new Date(value) : null;
        const oldDate = oldAsset[key]
          ? new Date(oldAsset[key]).toISOString()
          : null;

        if (newDate?.toISOString() !== oldDate) {
          updateData[key] = newDate;
          changedFields[key] = {
            from: oldAsset[key],
            to: value,
          };
        }

        continue;
      }

      /* ---------- Scalar Fields ---------- */
      if (oldAsset[key] !== value) {
        updateData[key] = value;
        changedFields[key] = {
          from: oldAsset[key],
          to: value,
        };
      }
    }

    /* ---------------- 5️⃣ Handle Images ---------------- */
    const existingImages = payload.existingImages
      ? Array.isArray(payload.existingImages)
        ? payload.existingImages
        : [payload.existingImages]
      : [];

    const newImages = files
      ? files.map((file) => `/uploads/assets/${file.filename}`)
      : [];

    updateData.images = [...existingImages, ...newImages];

    /* ---------------- 6️⃣ Update Asset ---------------- */
    const updatedAsset = await prisma.asset.update({
      where: { uid },
      data: updateData,
      include: {
        brand: true,
        category: true,
        subCategory: true,
        vendor: true,
        assetUnits: true,
      },
    });

    /* ---------------- 7️⃣ Update Asset Units ---------------- */
    if (
      payload.productIds &&
      payload.unitPrices &&
      payload.productIds.length === payload.unitPrices.length
    ) {
      await prisma.assetUnit.deleteMany({
        where: { assetId: updatedAsset.id },
      });

      const assetUnitData = payload.productIds.map((pid, idx) => ({
        assetId: updatedAsset.id,
        productId: pid,
        status: "IN_STOCK",
        purchasePrice: payload.unitPrices[idx],
      }));

      await prisma.assetUnit.createMany({
        data: assetUnitData,
        skipDuplicates: true,
      });
    }

    /* ---------------- 8️⃣ Save Log ---------------- */
    if (Object.keys(changedFields).length > 0) {
      await prisma.assetLog.create({
        data: {
          asset_id: updatedAsset.id,
          asset_uid: uid,
          context: ASSET_LOG_CONTEXT.UPDATE,
          description: `Updated fields: ${JSON.stringify(changedFields)}`,
          issuer: issuer?.userFirstName || "system",
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
        select: { id: true, name: true, is_active: true, uid: true },
      });
      if (!asset) return ErrorResponse(404, "Asset not found");

      const updatedAsset = await prisma.asset.update({
        where: { uid: uid },
        data: {
          is_active: !asset.is_active,
        },
      });

      // Create log (same logic, just toggle-aware text)
      await prisma.assetLog.create({
        data: {
          asset_id: updatedAsset.id,
          asset_uid: asset.uid,
          context: updatedAsset.is_active
            ? ASSET_LOG_CONTEXT.ACTIVATE
            : ASSET_LOG_CONTEXT.DELETE, // or DEACTIVATE
          description: `${updatedAsset.name} Asset ${
            updatedAsset.is_active ? "Activated" : "Deactivated"
          } by ${issuer?.userFirstName || "system"}`,
          issuer: issuer?.userFirstName || "system",
        },
      });

      return SuccessResponse(
        200,
        `Asset ${
          updatedAsset.is_active ? "activated" : "deactivated"
        } successfully`,
      );
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }
}

export default new AssetService();
