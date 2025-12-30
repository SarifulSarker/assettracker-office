import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
import { ASSET_LOG_CONTEXT } from "../utils/ASSET_LOG_CONTEXT.js";

const prisma = new PrismaClient();

class AssetAssignmentService {
  async assignAssetsToEmployee(employeeId, assetIds, issuer) {
    try {
      if (!employeeId || !assetIds?.length) {
        return ErrorResponse(400, "Employee or assets missing");
      }

      // Create all assignments in parallel
      const assignments = await Promise.all(
        assetIds.map((assetId) =>
          prisma.assetAssingmentEmployee.create({
            data: {
              assetId,
              employeeId,
              assignedAt: new Date(),
              is_active: true,
            },
          })
        )
      );
      await Promise.all(
        assetIds.map((assetId) =>
          prisma.assetLog.create({
            data: {
              asset_id: assetId,
              context: ASSET_LOG_CONTEXT.ASSIGN,
              description: `Assigned to employee ID ${employeeId} by ${
                issuer?.firstName || "system"
              }`,
              issuer: issuer?.firstName || "system",
            },
          })
        )
      );

      return SuccessResponse(200, "Assets assigned successfully", assignments);
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }

  async getAssetsByEmployee(employeeId) {
    try {
      const assets = await prisma.assetAssingmentEmployee.findMany({
        where: { employeeId },
        include: { asset: true },
      });
      //  console.log("form api",assets)

      return SuccessResponse(
        200,
        "Get Assets By Employee fetched successfully",
        assets
      );
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }

  async getEmployeesByAsset(uid) {
    try {
      const employees = await prisma.assetAssingmentEmployee.findMany({
        where: {
          asset: {
            uid: uid,
          },
        },
        include: { employee: true },
        orderBy: { createdAt: "desc" },
      });

      return SuccessResponse(
        200,
        "Get Employees by asset fetched successfully",
        employees
      );
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }

 async unassignAssetService(assignmentId, issuer) {
  try {
    if (!assignmentId) {
      return ErrorResponse(400, "Assignment ID is required");
    }

    // 1️⃣ Check active assignment
    const assignment = await prisma.assetAssingmentEmployee.findFirst({
      where: {
        id: Number(assignmentId),
        is_active: true,
        unassignedAt: null,
      },
    });

    if (!assignment) {
      return ErrorResponse(404, "Active assignment not found");
    }

    // 2️⃣ Unassign asset
    const updatedAssignment = await prisma.assetAssingmentEmployee.update({
      where: { id: Number(assignmentId) },
      data: {
        is_active: false,
        unassignedAt: new Date(),
      },
    });

  

    return SuccessResponse(
      200,
      "Asset unassigned successfully",
      updatedAssignment
    );
  } catch (error) {
    console.error("UNASSIGN ASSET SERVICE ERROR:", error);
    return ErrorResponse(500, error.message || "Server error");
  }
}


  async getUnassignedAssetsService({ search }) {
    try {
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

      const whereCondition = {
        is_active: true,
        ...filters,
        assetAssingmentEmployees: {
          none: { is_active: true }, // 🔥 no active assignment
        },
      };

      const assets = await prisma.asset.findMany({
        where: whereCondition,
        include: {
          brand: true,
          category: true,
          subCategory: true,
          vendor: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return SuccessResponse(200, "Unassigned assets fetched successfully", {
        assets,
      });
    } catch (error) {
      console.error("getUnassignedAssetsService error:", error);
      return ErrorResponse(500, error.message || "Server error");
    }
  }

    async getLogsByAssetAndContext(assetId, context) {
    try {
      if (!assetId) {
        return ErrorResponse(400, "Asset ID is required");
      }

      const whereClause = { asset_id: assetId };
      if (context && context !== "ALL") {
        whereClause.context = context;
      }

      const logs = await prisma.assetLog.findMany({
        where: whereClause,
        include: {
          asset: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return SuccessResponse(200, "Asset logs fetched successfully", logs);
    } catch (err) {
      console.error("AssetLogService Error:", err);
      return ErrorResponse(500, "Server error", err);
    }
  }
}

export default new AssetAssignmentService();
