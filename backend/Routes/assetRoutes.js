import express from "express";
import assetController from "../Controller/assetController.js";
import uploadAssetImages from "../Middleware/uploadAssetImages.js";

const router = express.Router();
router.post(
  "/create-asset",
  uploadAssetImages, // accept any field
  assetController.createAsset,
);

router.get("/get-all-assets", assetController.getAll);
router.get("/:uid", assetController.getAssetById);

router.put(
  "/:uid",
  uploadAssetImages,
  assetController.updateAsset,
);

router.delete("/:uid", assetController.deleteAsset);

export default router;
