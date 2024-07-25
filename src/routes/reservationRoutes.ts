import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import authMiddleware from "../middlewares/authMiddleware";
import { createReservation, getPendingReservations } from "../controllers/reservationController";
import { createReservationSchema } from "../schemas/reservation/createReservationSchema";

const router = Router();

router.post("/create", validateRequest(createReservationSchema), authMiddleware, createReservation);
router.get("/pendingReservation", authMiddleware, getPendingReservations);

export default router;