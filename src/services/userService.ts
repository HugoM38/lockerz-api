import User from "../models/userModel";
import Reservation from "../models/reservationModel";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const editUserById = async (
  senderId: string,
  firstname: string,
  lastname: string
) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
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
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mot de passe incorrect");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  return await user.save();
};

const deleteUserById = async (senderId: string) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  const reservations = await Reservation.find({
    owner: sender,
    status: { $in: ["pending", "accepted"] },
  });

  if (reservations.length > 0) {
    throw new Error("Vous avez des réservations en cours");
  }

  const uniqueEmail = `deleted-${Date.now()}-${senderId}@myges.fr`;

  await User.updateOne(
    { _id: sender },
    {
      $unset: { password: 1 },
      $set: {
        firstname: "Utilisateur",
        lastname: "Supprimé",
        email: uniqueEmail,
      },
    }
  );
};

export { editUserById, editPasswordById, deleteUserById };
