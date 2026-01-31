import { Router } from "express";

import RoleAndPermissionController from "../Controller/roleAndPermissionController.js";

const router = Router();

router.post("/roles", RoleAndPermissionController.createRole);

export default router;
