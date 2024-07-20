import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import authMiddleware from "../middlewares/authMiddleware";
import { createReservation } from "../controllers/reservationController";
import { createReservationSchema } from "../schemas/reservation/createReservationSchema";

const router = Router();

router.post("/create", validateRequest(createReservationSchema), authMiddleware, createReservation);

export default router;