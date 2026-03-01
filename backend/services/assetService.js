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
        units = 1,
        productIds = [],
        unitPrices = [],
        brandId,
        categoryId,
        subCategoryId,
        vendorId,
        specs = "",
        notes = "",
        purchaseDate,
      } = data;

      const { images = [], unitImages = [] } = files;

      // -------------------- VALIDATION --------------------
      if (!name) return ErrorResponse(400, "Asset name is required");

      const totalUnits = Number(units);

      if (productIds.length !== totalUnits) {
        return ErrorResponse(400, "Units and productIds length mismatch");
      }

      if (unitPrices.length > 0 && unitPrices.length !== totalUnits) {
        return ErrorResponse(400, "Each unit must have a price");
      }

      if (unitImages.length > 0 && unitImages.length !== totalUnits) {
        return ErrorResponse(400, "Each unit must have an image");
      }

      // -------------------- CREATE ASSET --------------------
      const asset = await prisma.asset.create({
        data: {
          name,
          uid: generateAssetUID(new Date()),
          specs,
          notes,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          units: totalUnits,
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
      // -------------------- CREATE ASSET UNITS --------------------
      const assetUnits = [];
      for (let i = 0; i < totalUnits; i++) {
        const images =
          unitImages[i]?.map((f) => `/uploads/assets/${f.filename}`) || [];

        assetUnits.push({
          assetId: asset.id,
          productId: productIds[i],
          status: "IN_STOCK",
          purchasePrice:
            unitPrices[i] !== undefined && unitPrices[i] !== null
              ? Number(unitPrices[i])
              : null,
          images: images,
        });
      }

      await prisma.assetUnit.createMany({
        data: assetUnits,
        // skipDuplicates: true,
      });

      // -------------------- CREATE ASSET LOG --------------------
      await prisma.assetLog.create({
        data: {
          asset_id: asset.id,
          asset_uid: asset.uid,
          context: ASSET_LOG_CONTEXT.CREATE,
          description: `Asset created by ${issuer?.firstName || "system"}`,
          issuer:issuer?.userFirstName || "system",
        },
      });

      return SuccessResponse(
        201,
        "Asset created successfully with unit prices and images",
        asset,
      );
    } catch (error) {
      console.error("Create Asset Error:", error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  // UPDATE
  async updateAsset(uid, data, issuer, files) {
    try {
      if (!uid) return ErrorResponse(400, "Asset UID is required");

      const {
        name,
        units = 1,
        productIds = [],
        unitPrices = [],
        unitStatuses = [],
        existingUnitImages = [], // from frontend: updated array after deletions
        brandId,
        categoryId,
        subCategoryId,
        vendorId,
        specs = "",
        notes = "",
        purchaseDate,
      } = data;

      const totalUnits = Number(units);
      if (!name) return ErrorResponse(400, "Asset name is required");

      /* -------------------- 1️⃣ Fetch Old Asset -------------------- */
      const oldAsset = await prisma.asset.findUnique({
        where: { uid },
        include: {
          assetUnits: true,
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
      });

      if (!oldAsset) return ErrorResponse(404, "Asset not found");

      const changedFields = {};
      const updateData = {};

      /* -------------------- 2️⃣ Scalar Compare -------------------- */
      if (oldAsset.name !== name) {
        updateData.name = name;
        changedFields.name = { from: oldAsset.name, to: name };
      }
      if (oldAsset.specs !== specs) {
        updateData.specs = specs;
        changedFields.specs = { from: oldAsset.specs, to: specs };
      }
      if (oldAsset.notes !== notes) {
        updateData.notes = notes;
        changedFields.notes = { from: oldAsset.notes, to: notes };
      }

      const newDate = purchaseDate ? new Date(purchaseDate) : null;
      const oldDate = oldAsset.purchaseDate
        ? new Date(oldAsset.purchaseDate).toISOString()
        : null;
      if (newDate?.toISOString() !== oldDate) {
        updateData.purchaseDate = newDate;
        changedFields.purchaseDate = {
          from: oldAsset.purchaseDate,
          to: purchaseDate,
        };
      }

      if (oldAsset.units !== totalUnits) {
        updateData.units = totalUnits;
        changedFields.units = { from: oldAsset.units, to: totalUnits };
      }

      /* -------------------- 3️⃣ Relation Compare -------------------- */
      const relationMap = {
        brand: { id: brandId, old: oldAsset.brand, model: prisma.brand },
        category: {
          id: categoryId,
          old: oldAsset.category,
          model: prisma.category,
        },
        subCategory: {
          id: subCategoryId,
          old: oldAsset.subCategory,
          model: prisma.category,
        },
        vendor: { id: vendorId, old: oldAsset.vendor, model: prisma.vendor },
      };

      for (const key of Object.keys(relationMap)) {
        const { id, old, model } = relationMap[key];
        const newId = id ? Number(id) : null;

        if (old?.id !== newId) {
          if (!newId) {
            updateData[key] = { disconnect: true };
            changedFields[key] = { from: old?.name || "N/A", to: "Removed" };
          } else {
            const newEntity = await model.findUnique({
              where: { id: newId },
              select: { name: true },
            });
            updateData[key] = { connect: { id: newId } };
            changedFields[key] = {
              from: old?.name || "N/A",
              to: newEntity?.name || "N/A",
            };
          }
        }
      }

      /* -------------------- 4️⃣ Update Asset -------------------- */
      if (Object.keys(updateData).length > 0) {
        await prisma.asset.update({ where: { uid }, data: updateData });
      }

      /* -------------------- 5️⃣ Update Units -------------------- */
      const existingUnits = oldAsset.assetUnits;

      for (let i = 0; i < totalUnits; i++) {
        const oldUnit = existingUnits[i];
        const newProductId = productIds[i]; // KEEP STRING!
        const newPrice =
          unitPrices[i] !== undefined ? Number(unitPrices[i]) : null;
        const newStatus = unitStatuses[i] || "IN_STOCK";

        if (oldUnit) {
          const unitChanges = {};
          if (oldUnit.productId !== newProductId)
            unitChanges.productId = {
              from: oldUnit.productId,
              to: newProductId,
            };
          if (oldUnit.purchasePrice !== newPrice)
            unitChanges.purchasePrice = {
              from: oldUnit.purchasePrice,
              to: newPrice,
            };
          if (oldUnit.status !== newStatus)
            unitChanges.status = { from: oldUnit.status, to: newStatus };
          if (Object.keys(unitChanges).length > 0)
            changedFields[`unit_${i + 1}`] = unitChanges;

          /* --- IMAGE HANDLING --- */
          const existingImagesFromClient =
            existingUnitImages[i] && Array.isArray(existingUnitImages[i])
              ? existingUnitImages[i]
              : [];

          const unitFiles = (files || []).filter(
            (f) => f.fieldname === `unitImages[${i}][]`,
          );
          const newImages = unitFiles.map(
            (f) => `/uploads/assets/${f.filename}`,
          );
          const finalImages = [...existingImagesFromClient, ...newImages];

          await prisma.assetUnit.update({
            where: { id: oldUnit.id },
            data: {
              productId: newProductId,
              purchasePrice: newPrice,
              status: newStatus,
              images: finalImages,
            },
          });
        } else {
          const unitFiles = (files || []).filter(
            (f) => f.fieldname === `unitImages[${i}][]`,
          );
          const newImages = unitFiles.map(
            (f) => `/uploads/assets/${f.filename}`,
          );

          await prisma.assetUnit.create({
            data: {
              assetId: oldAsset.id,
              productId: newProductId,
              purchasePrice: newPrice,
              status: newStatus,
              images: newImages,
            },
          });
          changedFields[`unit_${i + 1}`] = "Created new unit";
        }
      }

      /* -------------------- 6️⃣ Delete Extra Units -------------------- */
      if (existingUnits.length > totalUnits) {
        const extraUnits = existingUnits.slice(totalUnits);
        await prisma.assetUnit.deleteMany({
          where: { id: { in: extraUnits.map((u) => u.id) } },
        });
        changedFields.deletedUnits = extraUnits.length;
      }

      /* -------------------- 7️⃣ Save Log -------------------- */
      if (Object.keys(changedFields).length > 0) {
        await prisma.assetLog.create({
          data: {
            asset_id: oldAsset.id,
            asset_uid: uid,
            context: ASSET_LOG_CONTEXT.UPDATE,
            description: JSON.stringify(changedFields, null, 2),
            issuer: issuer?.userFirstName || "system",
          },
        });
      }

      return SuccessResponse(200, "Asset updated successfully");
    } catch (error) {
      console.error("UPDATE ASSET ERROR:", error);
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
          issuer:issuer?.userFirstName || "system",
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
