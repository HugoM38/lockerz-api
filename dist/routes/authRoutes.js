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
const router = (0, express_1.Router)();
router.post("/signup", (0, validateRequest_1.default)(signupSchema_1.signupSchema), authController_1.signup);
router.post("/signin", (0, validateRequest_1.default)(signinSchema_1.signinSchema), authController_1.signin);
exports.default = router;
