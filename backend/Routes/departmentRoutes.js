import { Router } from "express";
import departmentController from "../Controller/departmentController.js";



const router = Router();

router.post('/create-department',departmentController.create);

router.get("/get-all-department", departmentController.getAll);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.update);
router.delete("/:id", departmentController.delete);


export default router