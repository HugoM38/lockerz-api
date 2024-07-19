import User from "../models/userModel";
import bcrypt from "bcryptjs";

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

const editPasswordById = async (
  senderId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findOne({ senderId });
  if (!user) throw new Error("L'utilisateur n'existe pas");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mot de passe incorrect");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  return await user.save();
};

const deleteUserById = async (senderId: string) => {
  const user = await User.findOne({ senderId });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  await User.updateOne(
    { senderId },
    {
      $unset: { email: "", password: "" },
      $set: { firstname: "Utilisateur", lastname: "Supprimé" },
    }
  );
};



export { editUserById, editPasswordById, deleteUserById };
