import { PrismaClient } from "@prisma/client";
import { SuccessResponse, ErrorResponse } from "../utils/return.js";
import { generateUID } from "../utils/uuid.js";
import { ASSET_LOG_CONTEXT } from "../utils/ASSET_LOG_CONTEXT.js";

const prisma = new PrismaClient();

class AssetAssignmentService {
  async assignAssetsToEmployee(employeeId, assetUnitIds, issuer) {
    try {
      if (!employeeId || !assetUnitIds?.length) {
        return ErrorResponse(400, "Employee or asset units missing");
      }

      // 1️⃣ Fetch employee
      const employee = await prisma.employee.findUnique({
        where: { id: Number(employeeId) },
        select: {
          id: true,
          fullName: true,
          email: true,
          department: true,
          designation: true,
        },
      });

      if (!employee) {
        return ErrorResponse(404, "Employee not found");
      }

      // 2️⃣ Fetch assetUnits with asset info
      const assetUnits = await prisma.assetUnit.findMany({
        where: { id: { in: assetUnitIds.map(Number) } },
        include: {
          asset: {
            select: {
              id: true,
              uid: true,
              name: true,
            },
          },
        },
      });

      if (!assetUnits.length) {
        return ErrorResponse(404, "Asset units not found");
      }

      // 3️⃣ Transaction (Create assignment + update unit + log)
      const result = await prisma.$transaction(async (tx) => {
        const createdAssignments = [];

        for (const unit of assetUnits) {
          if (unit.assigned) {
            throw new Error(`AssetUnit ${unit.id} already assigned`);
          }

          // 3a. Create assignment
          const assignment = await tx.assetAssingmentEmployee.create({
            data: {
              assetId: unit.assetId,
              assetUnitId: unit.id,
              employeeId: employee.id,
              assignedAt: new Date(),
              is_active: true,
            },
          });

          // 3b. Update assetUnit
          await tx.assetUnit.update({
            where: { id: unit.id },
            data: {
              assigned: true,
              status: "IN_USE",
            },
          });

          // 3c. Create Log
          await tx.assetLog.create({
            data: {
              asset_id: unit.assetId,
              asset_uid: unit.asset?.uid,
              context: ASSET_LOG_CONTEXT.ASSIGN,
              description: JSON.stringify({
                action: "ASSIGN",
                employee: {
                  id: employee.id,
                  name: employee.fullName,
                  email: employee.email,
                  department: employee.department,
                  designation: employee.designation,
                },
                asset: {
                  id: unit.assetId,
                  name: unit.asset?.name,
                },
                assetUnit: {
                  id: unit.id,
                  productId: unit.productId,
                },
                assignedAt: new Date(),
              }),
              issuer: issuer?.userFirstName || "system",
            },
          });

          createdAssignments.push(assignment);
        }

        return createdAssignments;
      });

      return SuccessResponse(200, "Asset units assigned successfully", result);
    } catch (error) {
      console.error("ASSIGN ERROR:", error);
      return ErrorResponse(500, error.message || "Server Error");
    }
  }

  //employee has this assets
  async getAssetsByEmployee(employeeId) {
    try {
      const assets = await prisma.assetAssingmentEmployee.findMany({
        where: { employeeId },
        include: {
          asset: {
            include: {
              category: true,
              subCategory: true,
              assetUnits: true,
            },
          },
        },
      });

      return SuccessResponse(
        200,
        "Get Assets By Employee fetched successfully",
        assets,
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
        include: {
          employee: true,
          assetUnit: {
            select: {
              id: true,
              productId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return SuccessResponse(
        200,
        "Get Employees by asset fetched successfully",
        employees,
      );
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }

  // ---------------------- services/assetAssignmentService.js ----------------------
  async unassignAssetsService(assetUnitIds) {
    try {
      if (!assetUnitIds || !assetUnitIds.length) {
        return ErrorResponse(400, "Asset Unit IDs are required");
      }

      // 1️⃣ Find active assignments for these asset units
      const assignments = await prisma.assetAssingmentEmployee.findMany({
        where: {
          assetUnitId: { in: assetUnitIds.map(Number) },
          is_active: true,
          unassignedAt: null,
        },
      });

      if (!assignments.length) {
        return ErrorResponse(
          404,
          "No active assignments found for these units",
        );
      }

      // 2️⃣ Update assignments to mark unassigned
      await prisma.assetAssingmentEmployee.updateMany({
        where: {
          assetUnitId: { in: assetUnitIds.map(Number) },
        },
        data: {
          is_active: false,
          unassignedAt: new Date(),
        },
      });

      // 3️⃣ Update AssetUnit status and assigned field
      await prisma.assetUnit.updateMany({
        where: {
          id: { in: assetUnitIds.map(Number) },
        },
        data: {
          status: "IN_STOCK",
          assigned: false,
        },
      });

      return SuccessResponse(
        200,
        "Assets unassigned successfully",
        assignments,
      );
    } catch (error) {
      console.error("UNASSIGN ASSET SERVICE ERROR:", error);
      return ErrorResponse(500, error.message || "Server error");
    }
  }
  async getUnassignedAssetUnitsService({ search }) {
    try {
      let filters = {
        assigned: false, // only unassigned units
      };

      // 🔍 Search by asset name
      if (search) {
        const terms = search.trim().split(/\s+/);
        filters.asset = {
          AND: terms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
          })),
        };
      }

      const assetUnits = await prisma.assetUnit.findMany({
        where: filters,
        include: {
          asset: {
            include: {
              brand: true,
              category: true,
              subCategory: true,
              vendor: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return SuccessResponse(
        200,
        "Unassigned asset units fetched successfully",
        {
          assetUnits,
        },
      );
    } catch (error) {
      console.error("getUnassignedAssetUnitsService error:", error);
      return ErrorResponse(500, error.message || "Server error");
    }
  }

  //asset log by context
  async getLogsByAssetAndContext(assetUId, context) {
    try {
      if (!assetUId) {
        return ErrorResponse(400, "Asset UID is required");
      }

      const whereClause = { asset_uid: assetUId };
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

  async getAssetDetails(uid, context) {
    try {
      if (!uid) {
        return ErrorResponse(400, "Asset UID is required");
      }

      /* ---------------- Asset Info ---------------- */
      const asset = await prisma.asset.findUnique({
        where: { uid },
        include: {
          vendor: true,
          brand: true,
          category: true,
          subCategory: true,
        },
      });

      if (!asset) {
        return ErrorResponse(404, "Asset not found");
      }

      /* ---------------- Employees (Assignment) ---------------- */
      const employees = await prisma.assetAssingmentEmployee.findMany({
        where: {
          asset: {
            uid: uid,
          },
        },
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      /* ---------------- Logs ---------------- */
      const logWhere = {
        asset_uid: uid,
      };

      if (context && context !== "ALL") {
        logWhere.context = context;
      }

      const logs = await prisma.assetLog.findMany({
        where: logWhere,
        include: {
          employee: true,
          asset: false, // asset already fetched
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return SuccessResponse(200, "Asset details fetched successfully", {
        asset,
        employees,
        logs,
      });
    } catch (err) {
      console.error("AssetService Error:", err);
      return ErrorResponse(500, "Server error", err);
    }
  }

  //for report
  async getAssetAssignmentData(page, pageSize, exportAll = false) {
    try {
      const skip = exportAll ? undefined : (page - 1) * pageSize;
      const take = exportAll ? undefined : pageSize;

      const total = await prisma.employee.count();

      const employees = await prisma.employee.findMany({
        include: {
          assetAssingmentEmployees: {
            where: { is_active: true },
            include: {
              asset: {
                include: { category: true, subCategory: true },
              },
            
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      });

      const data = employees.map((emp, index) => {
        const assets = emp.assetAssingmentEmployees.map((a) => a.asset);

        return {
          sl: skip ? skip + index + 1 : index + 1, // serial number
          employeeName: emp.fullName,
          employeeUid: emp.uid,
          assignedAsset: assets.map((a) => a.name).join(", "),
          assetType: assets.map((a) => a.category?.name || "").join(", "),
          assetPrice: assets.reduce(
            (sum, a) => sum + (a.purchasePrice || 0),
            0,
          ),
          purchaseDate: assets
            .map((a) => a.purchaseDate?.toISOString().split("T")[0] || "")
            .join(", "),
        };
      });
  
      return SuccessResponse(200, "Asset Assignment Data fetched", {
        data,
        total,
      });
    } catch (err) {
      console.error(err);
      return ErrorResponse(500, "Server error", err);
    }
  }
}

export default new AssetAssignmentService();
