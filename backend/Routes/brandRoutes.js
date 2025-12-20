import { Router } from "express";
import brandController from "../Controller/brandController.js";

const router = Router();

router.post("/create-brand", brandController.createBrand);
router.get("/get-all-brand", brandController.getAll);
router.get("/:id", brandController.getBrandById);
router.put("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);


export default router