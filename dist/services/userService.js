"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.editPasswordById = exports.editUserById = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const reservationModel_1 = __importDefault(require("../models/reservationModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const editUserById = (senderId, firstname, lastname) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = new mongoose_1.default.Types.ObjectId(senderId);
    const user = yield userModel_1.default.findOne({ _id: sender });
    if (!user)
        throw new Error("L'utilisateur n'existe pas");
    if (firstname)
        user.firstname = firstname;
    if (lastname)
        user.lastname = lastname;
    return yield user.save();
});
exports.editUserById = editUserById;
const editPasswordById = (senderId, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = new mongoose_1.default.Types.ObjectId(senderId);
    const user = yield userModel_1.default.findOne({ _id: sender });
    if (!user)
        throw new Error("L'utilisateur n'existe pas");
    const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isMatch)
        throw new Error("Mot de passe incorrect");
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    return yield user.save();
});
exports.editPasswordById = editPasswordById;
const deleteUserById = (senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = new mongoose_1.default.Types.ObjectId(senderId);
    const user = yield userModel_1.default.findOne({ _id: sender });
    if (!user)
        throw new Error("L'utilisateur n'existe pas");
    const reservations = yield reservationModel_1.default.find({
        owner: sender,
        status: { $in: ["pending", "accepted"] },
    });
    if (reservations.length > 0) {
        throw new Error("Vous avez des réservations en cours");
    }
    const uniqueEmail = `deleted-${Date.now()}-${senderId}@myges.fr`;
    yield userModel_1.default.updateOne({ _id: sender }, {
        $unset: { password: 1 },
        $set: {
            firstname: "Utilisateur",
            lastname: "Supprimé",
            email: uniqueEmail,
        },
    });
});
exports.deleteUserById = deleteUserById;
