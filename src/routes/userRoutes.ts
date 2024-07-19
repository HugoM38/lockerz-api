import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { deleteUser, editPassword, editUser } from "../controllers/userController";
import { editUserSchema } from "../schemas/user/editUserSchema";
import { editPasswordSchema } from "../schemas/user/editPasswordSchema";

const router = Router();

router.patch("/edit", validateRequest(editUserSchema), editUser);
router.patch("/editPassword", validateRequest(editPasswordSchema), editPassword);
router.delete("/delete", deleteUser);

export default router;