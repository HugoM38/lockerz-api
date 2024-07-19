import { Request, Response } from "express";
import { editUserById } from "../services/userService";

const editUser = async (req: Request & { user?: string }, res: Response) => {
  try {
    const { firstname, lastname } = req.body;
    const user = await editUserById(req.user!, firstname, lastname);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "L'utilisateur n'existe pas") {
        res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

export { editUser };
