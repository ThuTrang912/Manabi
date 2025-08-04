import express from "express";
import { getFoldersByUser } from "../controllers/folderController.js";

const router = express.Router();

// GET /api/folders?userId=xxx&sort=createdAt|name|...&order=asc|desc
router.get("/", getFoldersByUser);

export default router;
