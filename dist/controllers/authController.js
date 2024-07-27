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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const authService_1 = require("../services/authService");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, email, password } = req.body;
        const { token, user } = yield (0, authService_1.register)(firstname, lastname, email, password);
        res.status(201).json({ token, user });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Utilisateur déjà existant") {
                return res.status(409).json({ error: "Utilisateur déjà existant" });
            }
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "Une erreur inconnue s'est produite" });
        }
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { token, user } = yield (0, authService_1.login)(email, password);
        res.status(200).json({ token, user });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Utilisateur non trouvé") {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "Une erreur inconnue s'est produite" });
        }
    }
});
exports.signin = signin;
