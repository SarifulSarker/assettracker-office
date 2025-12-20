import express from "express";
import designationController from "../Controller/designationController.js";

const router = express.Router();

router.post("/create-designation", designationController.createDesignation);
router.get("/get-all-designation", designationController.getDesignations);
router.get("/:id", designationController.getDesignationById);
router.put("/:id", designationController.updateDesignation);
router.delete("/:id", designationController.deleteDesignation);

export default router;
