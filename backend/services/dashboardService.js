import { PrismaClient, UnitStatus } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
const prisma = new PrismaClient();


class DashboardService {
  async getAssetOverview() {
    try {
      const [
        totalAssets,
        totalAssetValue,
        inUseCount,
        inStockCount,
        unitsInMaintenance,
        inLostCount,
      ] = await Promise.all([
        prisma.assetUnit.count({
          where: {
            status: {
              not: UnitStatus.SOLD,
            },
          },
        }),

        prisma.assetUnit.aggregate({
          _sum: { purchasePrice: true },
        }),

        prisma.assetUnit.count({
          where: { status: UnitStatus.IN_USE },
        }),

        prisma.assetUnit.count({
          where: { status: UnitStatus.IN_STOCK },
        }),

        prisma.assetUnit.count({
          where: { status: UnitStatus.MAINTENANCE },
        }),

        prisma.assetUnit.count({
          where: { status: UnitStatus.LOST },
        }),
      ]);

      return SuccessResponse(200, "Asset overview fetched successfully", {
        totalAssets,
        totalAssetValue: totalAssetValue._sum.purchasePrice || 0,
        unitsInUse: inUseCount,
        unitsInStock: inStockCount,
        unitsInMaintenance:0,
        unitsLost: inLostCount,
      });
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async getAssetsByCategory() {
    try {
      const assets = await prisma.asset.findMany({
        where: {
          is_active: true,
          categoryId: { not: null },
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
          assetUnits: {
            select: { purchasePrice: true },
          },
        },
      });

      const grouped = {};

      assets.forEach((asset) => {
        const catId = asset.category.id;
        const catName = asset.category.name;

        if (!grouped[catId]) {
          grouped[catId] = {
            name: catName,
            count: 0,
            totalValue: 0,
          };
        }

        grouped[catId].count += asset.assetUnits.length;

        asset.assetUnits.forEach((unit) => {
          grouped[catId].totalValue += unit.purchasePrice || 0;
        });
      });

      const result = Object.values(grouped);

      const data = {
        categories: result.map((r) => r.name),
        countSeries: result.map((r) => r.count),
        priceSeries: result.map((r) => Math.round(r.totalValue)),
      };

      return SuccessResponse(
        200,
        "Assets by category fetched successfully",
        data,
      );
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }
  async getDepartmentWiseAssetCount() {
    try {
      // 1️⃣ Fetch all active asset assignments with employee & department
      const assignments = await prisma.assetAssingmentEmployee.findMany({
        where: { is_active: true },
        include: {
          employee: {
            select: {
              departmentId: true,
              department: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // 2️⃣ Count assets per department
      const countMap = {};
      assignments.forEach((a) => {
        const deptId = a.employee?.departmentId;
        const deptName = a.employee?.department?.name || "Unknown";
        if (!deptId) return;

        if (!countMap[deptId]) {
          countMap[deptId] = { department: deptName, count: 0 };
        }
        countMap[deptId].count += 1;
      });

      // 3️⃣ Convert to array
      const data = Object.values(countMap);

      return { success: true, data };
    } catch (err) {
      console.error("Error fetching department-wise asset count:", err);
      return { success: false, message: "Failed to fetch department data" };
    }
  }
}

export default new DashboardService();
