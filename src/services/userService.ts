import e from "express";
import User from "../models/userModel";

const editUserById = async (
  senderId: string,
  firstname: string,
  lastname: string
) => {
  const user = await User.findOne({ senderId });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;

  return await user.save();
};

export { editUserById };
