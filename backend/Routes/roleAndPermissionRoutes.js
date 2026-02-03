import { Router } from "express";

import RoleAndPermissionController from "../Controller/roleAndPermissionController.js";

const router = Router();
router.get("/getall-roles", RoleAndPermissionController.getRoles);

router.post("/create-roles", RoleAndPermissionController.createRole);
router.put("/update-roles/:id", RoleAndPermissionController.updateRole);

export default router;
