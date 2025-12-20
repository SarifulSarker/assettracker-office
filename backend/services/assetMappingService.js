import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";

const prisma = new PrismaClient();

class AssetAssignmentService {
async assignAssetsToEmployee(employeeId, assetIds) {
  try {
    if (!employeeId || !assetIds?.length) {
      return ErrorResponse(400, "Employee or assets missing");
    }

    const assignments = await Promise.all(
      assetIds.map((assetId) =>
        prisma.assetAssingmentEmployee.upsert({
          where: { assetId_employeeId: { assetId, employeeId } },
          update: { unassignedAt: null }, // ← re-assign asset
          create: { assetId, employeeId },
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

      return SuccessResponse(200, "Get Assets By Employee fetched successfully", assets);
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

      return SuccessResponse(200, "Get Employees by asset fetched successfully", employees);
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }

  async unassignAssetService (assignmentId) {
  try {
    if (!assignmentId) {
      return ErrorResponse(400,
         "Assignment ID is required", 
         "Error",
      );
    }

    // 1️⃣ check active assignment
    const assignment = await prisma.assetAssingmentEmployee.findFirst({
      where: {
        id: Number(assignmentId),
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
        unassignedAt: new Date(),
      },
    });

    return SuccessResponse(
      200,
      "Asset unassigned successfully",
      updated
    );
  } catch (error) {
    console.error("Unassign Asset Service Error:", error);
    return ErrorResponse(500, "Server error", error);
  }
}
}

export default new AssetAssignmentService();
