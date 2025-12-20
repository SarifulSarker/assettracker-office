import { Router } from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import brandRoutes from "./brandRoutes.js";
import vendorRoutes from "./vendorRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import assetRoutes from "./assetRoutes.js";
import designationRoutes from "./designationRoutes.js";
import assetMappingRoutes from "./assetMappingRoutes.js"
import authMiddleware from "../Middleware/AuthMiddleware.js";

const router = Router();

/* ---------- PUBLIC ROUTES ---------- */
router.use("/auth", authRoutes);

/* ---------- GLOBAL AUTH MIDDLEWARE ---------- */
router.use(authMiddleware.authGuard);

/* ---------- PROTECTED ROUTES ---------- */
const protectedRoutes = [
  { path: "/user", route: userRoutes },
  { path: "/department", route: departmentRoutes },
  { path: "/category", route: categoryRoutes },
  { path: "/brand", route: brandRoutes },
  { path: "/vendor", route: vendorRoutes },
  { path: "/employee", route: employeeRoutes },
  { path: "/asset", route: assetRoutes },
  { path: "/designation", route: designationRoutes },
  {path:"/asset-mapping", route:assetMappingRoutes},
];

protectedRoutes.forEach((item) => {
  router.use(item.path, item.route);
});

export default router;
