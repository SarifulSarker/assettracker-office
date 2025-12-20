import { Router } from "express";
import vendorController from "../Controller/vendorController.js";

const router = Router();




router.post("/create-vendor", vendorController.createVendor);
router.get("/get-all-vendor", vendorController.getAllVendors);
router.get("/:id", vendorController.getVendorById);
router.put("/:id", vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);


export default router