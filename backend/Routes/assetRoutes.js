import express from "express";
import assetController from "../Controller/assetController.js";

const router = express.Router();

router.post("/create-asset", assetController.createAsset);
router.get("/get-all-assets", assetController.getAll);
router.get("/:id", assetController.getAssetById);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);

export default router;
