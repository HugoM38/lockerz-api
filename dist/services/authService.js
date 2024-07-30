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
exports.verifyCode = exports.sendVerificationCode = exports.login = exports.register = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
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
    if (!findUser.isEmailVerified)
        throw new Error("Email non vérifié");
    const token = jsonwebtoken_1.default.sign({ id: findUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return { token, user: findUser };
});
exports.login = login;
const sendVerificationCode = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new Error("Utilisateur non trouvé");
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    yield user.save();
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: 'lockerz.code.sender@gmail.com',
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    const mailOptions = {
        from: 'example@myges.com',
        to: email,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${verificationCode}`
    };
    yield transporter.sendMail(mailOptions);
    return { message: 'Code envoyé' };
});
exports.sendVerificationCode = sendVerificationCode;
const verifyCode = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email });
    if (!user)
        throw new Error("Utilisateur non trouvé");
    if (user.verificationCode === code) {
        user.isEmailVerified = true;
        user.verificationCode = "";
        yield user.save();
        return { message: 'Email vérifié' };
    }
    else {
        throw new Error("Code incorrect");
    }
});
exports.verifyCode = verifyCode;
