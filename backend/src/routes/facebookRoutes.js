import express from "express";
import { facebookCallback } from "../controllers/facebookController.js";

const router = express.Router();
router.get("/auth/facebook/callback", facebookCallback);

export default router;
