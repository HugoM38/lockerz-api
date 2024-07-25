import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import authMiddleware from "../middlewares/authMiddleware";
import { createReservation, getPendingReservations, terminateReservation, validateOrRefuseReservation,  } from "../controllers/reservationController";
import { createReservationSchema } from "../schemas/reservation/createReservationSchema";
import { validateReservationSchema } from "../schemas/reservation/validateReservationSchema";
import { terminateReservationSchema } from "../schemas/reservation/terminateReservationSchema";

const router = Router();

router.post("/create", validateRequest(createReservationSchema), authMiddleware, createReservation);
router.get("/pendingReservation", authMiddleware, getPendingReservations);
router.patch("/validateOrRefuse", authMiddleware, validateRequest(validateReservationSchema), validateOrRefuseReservation);
router.patch("/terminateReservation", authMiddleware, validateRequest(terminateReservationSchema), terminateReservation);

export default router;