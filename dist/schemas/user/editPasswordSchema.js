"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPasswordSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.editPasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(8).required(),
});
