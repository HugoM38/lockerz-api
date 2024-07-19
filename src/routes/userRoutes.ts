import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { deleteUser, editPassword, editUser, getUser, getUsers } from "../controllers/userController";
import { editUserSchema } from "../schemas/user/editUserSchema";
import { editPasswordSchema } from "../schemas/user/editPasswordSchema";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.patch("/edit", validateRequest(editUserSchema), authMiddleware, editUser);
router.patch("/editPassword", validateRequest(editPasswordSchema), authMiddleware, editPassword);
router.delete("/delete", authMiddleware, deleteUser);
router.get("/:id", authMiddleware, getUser);
router.get("/", authMiddleware, getUsers);

export default router;