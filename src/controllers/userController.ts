import { Request, Response } from "express";
import {
  deleteUserById,
  editPasswordById,
  editUserById,
} from "../services/userService";

const editUser = async (req: Request & { user?: string }, res: Response) => {
  try {
    const { firstname, lastname } = req.body;
    const user = await editUserById(req.user!, firstname, lastname);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "L'utilisateur n'existe pas") {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

const editPassword = async (
  req: Request & { user?: string },
  res: Response
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await editPasswordById(req.user!, oldPassword, newPassword);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "L'utilisateur n'existe pas") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Mot de passe incorrect") {
        return res.status(401).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

const deleteUser = async (req: Request & { user?: string }, res: Response) => {
  try {
    await deleteUserById(req.user!);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "L'utilisateur n'existe pas") {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
  }
};

export { editUser, editPassword, deleteUser };
