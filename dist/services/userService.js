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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const editUserById = (senderId, firstname, lastname) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ senderId });
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
    const user = yield userModel_1.default.findOne({ senderId });
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
    const user = yield userModel_1.default.findOne({ senderId });
    if (!user)
        throw new Error("L'utilisateur n'existe pas");
    yield userModel_1.default.updateOne({ senderId }, {
        $unset: { email: "", password: "" },
        $set: { firstname: "Utilisateur", lastname: "Supprimé" },
    });
});
exports.deleteUserById = deleteUserById;
