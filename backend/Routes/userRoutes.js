// routes/userRoutes.js
import { Router } from "express";
import UserController from "../Controller/UserController.js";
 import AuthMiddleware from "../Middleware/AuthMiddleware.js";

const router = Router();
router.post('/create-user',UserController.createUser);

router.get("/:id", UserController.getUserById);

router.get("/", UserController.getUsers);
router.put('/:id', UserController.updateUser);
router.delete('/:id',UserController.deleteUser)

export default router;
