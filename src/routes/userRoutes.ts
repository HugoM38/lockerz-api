import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { editUser } from "../controllers/userController";
import { editUserSchema } from "../schemas/user/editUserSchema";

const router = Router();

router.patch("/", validateRequest(editUserSchema), editUser);

export default router;