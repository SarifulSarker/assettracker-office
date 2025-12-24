import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class AssetAssignmentService {
  async assignAssetsToEmployee(employeeId, assetIds) {
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

  async getEmployeesByAsset(assetId) {
    try {
      const employees = await prisma.assetAssingmentEmployee.findMany({
        where: { assetId },
        include: { employee: true },
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

  async unassignAssetService(assignmentId) {
    try {
      if (!assignmentId) {
        return ErrorResponse(400, "Assignment ID is required", "Error");
      }

      // 1️⃣ check active assignment
      const assignment = await prisma.assetAssingmentEmployee.findFirst({
        where: {
          id: Number(assignmentId),
          is_active: true,
          unassignedAt: null,
        },
      });

      if (!assignment) {
        return ErrorResponse(404, "Active assignment not found", "Error");
      }

      // 2️⃣ unassign
      const updated = await prisma.assetAssingmentEmployee.update({
        where: { id: Number(assignmentId) },
        data: {

           is_active: false,
          unassignedAt: new Date(),
        },
      });

      return SuccessResponse(200, "Asset unassigned successfully", updated);
    } catch (error) {
      console.error("Unassign Asset Service Error:", error);
      return ErrorResponse(500, "Server error", error);
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
}

export default new AssetAssignmentService();
