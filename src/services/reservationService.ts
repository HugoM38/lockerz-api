import mongoose from "mongoose";
import User from "../models/userModel";
import Locker from "../models/lockerModel";
import Reservation, { IReservation } from "../models/reservationModel";

const createNewReservation = async (
  senderId: string,
  lockerId: string,
  members: string[]
) => {
  const membersSet = new Set(members);

  if (membersSet.size !== members.length) {
    throw new Error("La liste des membres contient des doublons");
  }

  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  const lockerToFind = new mongoose.Types.ObjectId(lockerId);
  const locker = await Locker.findOne({ _id: lockerToFind });
  if (!locker) throw new Error("Le casier n'existe pas");
  if (locker.status !== "available") throw new Error("Le casier est déjà occupé");

  for (let index = 0; index < members.length; index++) {
    const memberId = new mongoose.Types.ObjectId(members[index]);
    const member = await User.findOne({ _id: memberId });
    if (!member) throw new Error("Un ou plusieurs membres n'existent pas");
  }

  const newReservation = new Reservation({
    locker: lockerId,
    owner: senderId,
    members,
  });

  const savedReservation: IReservation = await newReservation.save();

  locker.status = "unavailable";
  locker.reservations.push(savedReservation._id as mongoose.Types.ObjectId);
  await locker.save();

  return newReservation;
};

export { createNewReservation };
