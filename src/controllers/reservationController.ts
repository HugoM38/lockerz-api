import { Request, Response } from "express";
import { createNewReservation } from "../services/reservationService";

const createReservation = async (
  req: Request & { user?: string },
  res: Response
) => {
  try {
    const { lockerId, members } = req.body;
    const reservation = await createNewReservation(
      req.user!,
      lockerId,
      members
    );
    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "Utilisateur inexistant") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message == "Le casier est déjà occupé") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message == "Un ou plusieurs membres n'existent pas") {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

export { createReservation };
