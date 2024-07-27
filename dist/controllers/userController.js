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
exports.getUsers = exports.getUser = exports.deleteUser = exports.editPassword = exports.editUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const userService_1 = require("../services/userService");
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname } = req.body;
        const user = yield (0, userService_1.editUserById)(req.user, firstname, lastname);
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "L'utilisateur n'existe pas") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "Une erreur inconnue s'est produite" });
        }
    }
});
exports.editUser = editUser;
const editPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = yield (0, userService_1.editPasswordById)(req.user, oldPassword, newPassword);
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "L'utilisateur n'existe pas") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Mot de passe incorrect") {
                return res.status(401).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "Une erreur inconnue s'est produite" });
        }
    }
});
exports.editPassword = editPassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userService_1.deleteUserById)(req.user);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "L'utilisateur n'existe pas") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "Une erreur inconnue s'est produite" });
        }
    }
});
exports.deleteUser = deleteUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.params.id.length !== 24)
            return res.status(400).json({ error: "ID invalide" });
        const user = yield userModel_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "Utilisateur introuvable" });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
});
exports.getUser = getUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(400).json({ error: "Une erreur inconnue s'est produite" });
    }
});
exports.getUsers = getUsers;
