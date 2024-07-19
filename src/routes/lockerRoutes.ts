import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { createLockerSchema } from "../schemas/locker/createLockerSchema";
import { createLocker } from "../controllers/lockerController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", validateRequest(createLockerSchema), authMiddleware, createLocker);

export default router;