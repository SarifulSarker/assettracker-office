import express from "express";
import DashboardController from "../Controller/dashboardController.js";
const router = express.Router();

router.get("/asset-overview", DashboardController.getAssetOverview);

router.get("/assets-by-category", DashboardController.getAssetsByCategory);
router.get("/assets-by-department", DashboardController.departmentWiseAssetCount);

export default router;
