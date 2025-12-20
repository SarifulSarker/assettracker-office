import { Router } from "express";
import categoryController from "../Controller/categoryController.js";



const router = Router();



router.post("/create-category", categoryController.create);
router.get("/get-all-category", categoryController.getAll);
router.get("/:id", categoryController.getOne);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.deleteCategoryOrSub);



export default router