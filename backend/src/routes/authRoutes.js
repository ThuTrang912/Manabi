import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();
// Đăng ký bằng email
router.post('/auth/signup', authController.registerWithEmail);
// Đăng nhập bằng email
router.post('/auth/login', authController.loginWithEmail);

export default router;
