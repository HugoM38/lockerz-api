"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const signinSchema_1 = require("../schemas/auth/signinSchema");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const signupSchema_1 = require("../schemas/auth/signupSchema");
const sendCodeSchema_1 = require("../schemas/auth/sendCodeSchema");
const checkCodeSchema_1 = require("../schemas/auth/checkCodeSchema");
const router = (0, express_1.Router)();
router.post("/signup", (0, validateRequest_1.default)(signupSchema_1.signupSchema), authController_1.signup);
router.post("/signin", (0, validateRequest_1.default)(signinSchema_1.signinSchema), authController_1.signin);
router.post("/sendCode", (0, validateRequest_1.default)(sendCodeSchema_1.sendCodeSchema), authController_1.sendCode);
router.post("/checkCode", (0, validateRequest_1.default)(checkCodeSchema_1.checkCodeSchema), authController_1.checkCode);
exports.default = router;
