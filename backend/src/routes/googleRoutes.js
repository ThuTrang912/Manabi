import express from "express";
import { googleCallback } from "../controllers/googleController.js";

const router = express.Router();
router.get("/auth/google/callback", googleCallback);

export default router;
