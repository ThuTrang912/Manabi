import express from "express";
const router = express.Router();
import {
  createFolder,
  getFolderById,
} from "../controllers/foldersController.js";

// Tạo mới folder
router.post("/", createFolder);
// Lấy folder theo id
router.get("/:folderId", getFolderById);

export default router;
