import { Request, Response } from "express";
import { createNewLocker } from "../services/lockerService";
import Locker from "../models/lockerModel";

const createLocker = async (
  req: Request & { user?: string },
  res: Response
) => {
  try {
    const { number, localisation } = req.body;
    const locker = await createNewLocker(req.user!, number, localisation);
    res.status(201).json(locker);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "Utilisateur inexistant") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message == "Le casier existe déjà") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message == "L'utilisateur n'est pas administrateur") {
        return res.status(403).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

const getLockers = async (req: Request, res: Response) => {
  try {
    const lockers = await Locker.find().select("_id number localisation status");
    res.status(200).json(lockers);
  } catch (error) {
    res.status(400).json({ error: "Une erreur inconnue s'est produite" });
  }
}

const getAdminLockers = async (req: Request, res: Response) => {
  try {
    const lockers = await Locker.find();
    res.status(200).json(lockers);
  } catch (error) {
    res.status(400).json({ error: "Une erreur inconnue s'est produite" });
  }
}

export { createLocker, getLockers, getAdminLockers };
