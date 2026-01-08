import express from "express";
import AssetAssignmentController from "../Controller/assetMappingController.js";

const router = express.Router();

router.post("/", (req, res) =>
  AssetAssignmentController.assignAssets(req, res)
);
router.get("/employee/:id", (req, res) =>
  AssetAssignmentController.getAssetsByEmployee(req, res)
);
router.get("/asset/:uid", (req, res) =>
  AssetAssignmentController.getEmployeesByAsset(req, res)
);
router.put("/unassign/:assignmentId", AssetAssignmentController.unassingAssets);

router.get("/unassigned-asset", AssetAssignmentController.getUnassignedAssets);

router.get("/:assetUId/:context", AssetAssignmentController.getLogsByAsset);

router.get("/log/:uid/details", AssetAssignmentController.getAssetDetails);
export default router;
