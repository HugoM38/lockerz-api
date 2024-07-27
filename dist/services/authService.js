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
exports.login = exports.register = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (firstname, lastname, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email.endsWith("@myges.fr"))
        throw new Error("L'email doit être un email GES");
    const user = yield userModel_1.default.findOne({ email });
    if (user)
        throw new Error("Utilisateur déjà existant");
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const newUser = new userModel_1.default({
        firstname,
        lastname,
        email,
        role: "user",
        password: hashedPassword,
    });
    const userCreated = yield newUser.save();
    const token = jsonwebtoken_1.default.sign({ id: userCreated._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { token, user: userCreated };
});
exports.register = register;
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield userModel_1.default.findOne({ email });
    if (!findUser)
        throw new Error("Utilisateur non trouvé");
    const isMatch = yield bcryptjs_1.default.compare(password, findUser.password);
    if (!isMatch)
        throw new Error("Identifiants invalides");
    const token = jsonwebtoken_1.default.sign({ id: findUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { token, user: findUser };
});
exports.login = login;
