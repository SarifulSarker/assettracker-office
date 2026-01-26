import { PrismaClient } from "@prisma/client";
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
        inMaintenance,
        inLost,
      ] = await Promise.all([
        prisma.asset.count(),

        prisma.asset.aggregate({
          _sum: { purchasePrice: true },
        }),

        prisma.asset.count({
          where: { status: "inuse" },
        }),

        prisma.asset.count({
          where: { status: "instock" },
        }),

        prisma.asset.count({
          where: {
            status:  "maintenance",
           
          },
        }),
        prisma.asset.count({
          where: {
            status:  "lost",
           
          },
        }),
      ]);

      const data = {
        totalAssets,
        totalAssetValue: totalAssetValue._sum.purchasePrice || 0,
        assetsInUse: inUseCount,
        assetsInStock: inStockCount,
        assetsInMaintenance: inMaintenance,
        assetsLost:inLost,
      };

      return SuccessResponse(200, "Asset overview fetched successfully", data);
    } catch (error) {
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  async getAssetsByCategory() {
    try {
      const grouped = await prisma.asset.groupBy({
        by: ["categoryId"],
        where: {
          is_active: true,
          categoryId: { not: null },
        },
        _count: { id: true },
        _sum: { purchasePrice: true },
      });

      if (!grouped.length) {
        return SuccessResponse(200, "No category data found", {
          categories: [],
          countSeries: [],
          priceSeries: [],
        });
      }

      const categories = await prisma.category.findMany({
        where: {
          id: { in: grouped.map((g) => g.categoryId) },
        },
        select: { id: true, name: true },
      });

      const categoryMap = {};
      categories.forEach((c) => {
        categoryMap[c.id] = c.name;
      });

      const data = {
        categories: [],
        countSeries: [],
        priceSeries: [],
      };

      grouped.forEach((g) => {
        data.categories.push(categoryMap[g.categoryId] || "Unknown");
        data.countSeries.push(g._count.id);
        data.priceSeries.push(Math.round(g._sum.purchasePrice || 0));
      });

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
