import { Router } from "express";
import employeeController from "../Controller/employeeController.js";

const router = Router();

router.post("/create-employee", employeeController.createEmployee);
router.get("/get-all-employee", employeeController.getEmployees);
router.get("/:uid", employeeController.getEmployeeById);
router.put("/:uid", employeeController.updateEmployee);
router.delete("/:uid", employeeController.deleteEmployee);

export default router;
