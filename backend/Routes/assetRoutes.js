import express from "express";
import assetController from "../Controller/assetController.js";
import uploadAssetImages from "../Middleware/uploadAssetImages.js";

const router = express.Router();
router.post(
  "/create-asset",
  uploadAssetImages.array("images", 5), // 🔥 SAME KEY NAME
  assetController.createAsset,
);

router.get("/get-all-assets", assetController.getAll);
router.get("/:uid", assetController.getAssetById);
router.put(
  "/:uid",
  uploadAssetImages.array("images", 5),
  assetController.updateAsset,
);
router.delete("/:uid", assetController.deleteAsset);

export default router;
