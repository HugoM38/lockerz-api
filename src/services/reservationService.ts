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
  if (locker.status !== "available")
    throw new Error("Le casier est déjà occupé");

  const existingReservations = await Reservation.find({
    $and: [
      { status: { $in: ["pending", "accepted"] } },
      {
        $or: [
          { owner: senderId },
          { members: senderId },
          { members: { $in: members } },
        ],
      },
    ],
  });

  if (existingReservations.length > 0) {
    throw new Error(
      "L'utilisateur ou l'un des membres a déjà une réservation active pour un casier"
    );
  }

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

  await newReservation.save();

  locker.status = "unavailable";
  await locker.save();

  return newReservation;
};

const getThePendingReservations = async (senderId: string) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  if (user.role !== "admin")
    throw new Error("L'utilisateur n'est pas administrateur");

  return await Reservation.find({ status: "pending" })
    .populate({
      path: "locker",
      populate: {
        path: "localisation",
      },
    })
    .populate("owner")
    .populate("members");
};

const validateOrRefuseReservationById = async (
  senderId: string,
  reservationId: string,
  status: string
) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  if (user.role != "admin")
    throw new Error("L'utilisateur n'est pas administrateur");

  const reservationToFind = new mongoose.Types.ObjectId(reservationId);
  const reservation = await Reservation.findOne({ _id: reservationToFind });
  if (!reservation) throw new Error("La réservation n'existe pas");

  if (status === "accepted") {
    reservation.status = "accepted";
    await reservation.save();
  } else if (status === "refused") {
    reservation.status = "refused";
    await reservation.save();

    const lockerToFind = new mongoose.Types.ObjectId(reservation.locker);
    const locker = await Locker.findOne({ _id: lockerToFind });
    if (!locker) throw new Error("Le casier n'existe pas");

    locker.status = "available";
    await locker.save();
  } else {
    throw new Error("Le statut de la réservation est incorrect");
  }

  return reservation;
};

const terminateReservationById = async (
  senderId: string,
  reservationId: string
) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  const reservationToFind = new mongoose.Types.ObjectId(reservationId);
  const reservation = await Reservation.findOne({ _id: reservationToFind });
  if (!reservation) throw new Error("La réservation n'existe pas");

  if (user._id != reservation.owner) {
    if (user.role != "admin")
      throw new Error("L'utilisateur n'est pas administrateur");
  }

  reservation.status = "terminated";
  await reservation.save();

  const lockerToFind = new mongoose.Types.ObjectId(reservation.locker);
  const locker = await Locker.findOne({ _id: lockerToFind });
  if (!locker) throw new Error("Le casier n'existe pas");

  locker.status = "available";
  await locker.save();

  return reservation;
};

const getCurrentReservationOfUser = async (senderId: string) => {
  const sender = new mongoose.Types.ObjectId(senderId);
  const user = await User.findOne({ _id: sender });
  if (!user) throw new Error("L'utilisateur n'existe pas");

  const reservations = await Reservation.find({
    $or: [{ owner: senderId }, { members: senderId }],
    status: { $in: ["pending", "accepted"] },
  })
    .populate("owner", "-password")
    .populate("members", "-password");

  return reservations;
};

const getReservationsByLockerId = async (lockerId: string) => {
  const lockerToFind = new mongoose.Types.ObjectId(lockerId);
  const locker = await Locker.findOne({ _id: lockerToFind });
  if (!locker) throw new Error("Le casier n'existe pas");

  const reservations = await Reservation.find({ locker: lockerId })
    .populate("owner", "-password")
    .populate("members", "-password");

  return reservations;
};

export {
  createNewReservation,
  getThePendingReservations,
  validateOrRefuseReservationById,
  terminateReservationById,
  getCurrentReservationOfUser,
  getReservationsByLockerId
};
