import { Router } from "express";
import employeeController from "../Controller/employeeController.js";

const router = Router();

router.post("/create-employee", employeeController.createEmployee);
router.get("/get-all-employee", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
