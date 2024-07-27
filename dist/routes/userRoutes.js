"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const userController_1 = require("../controllers/userController");
const editUserSchema_1 = require("../schemas/user/editUserSchema");
const editPasswordSchema_1 = require("../schemas/user/editPasswordSchema");
const router = (0, express_1.Router)();
router.patch("/edit", (0, validateRequest_1.default)(editUserSchema_1.editUserSchema), userController_1.editUser);
router.patch("/editPassword", (0, validateRequest_1.default)(editPasswordSchema_1.editPasswordSchema), userController_1.editPassword);
router.delete("/delete", userController_1.deleteUser);
router.get("/:id", userController_1.getUser);
router.get("/", userController_1.getUsers);
exports.default = router;
