import express from "express";
import assetController from "../Controller/assetController.js";

const router = express.Router();

router.post("/create-asset", assetController.createAsset);
router.get("/get-all-assets", assetController.getAll);
router.get("/:uid", assetController.getAssetById);
router.put("/:uid", assetController.updateAsset);
router.delete("/:uid", assetController.deleteAsset);

export default router;
