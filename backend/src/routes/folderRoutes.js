import express from "express";
import {
  getFoldersByUser,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderCardSets,
} from "../controllers/folderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/folders - Get all folders for user
router.get("/", getFoldersByUser);

// POST /api/folders - Create new folder
router.post("/", createFolder);

// GET /api/folders/:id - Get folder by ID
router.get("/:id", getFolderById);

// PUT /api/folders/:id - Update folder
router.put("/:id", updateFolder);

// DELETE /api/folders/:id - Delete folder
router.delete("/:id", deleteFolder);

// GET /api/folders/:id/cardsets - Get card sets in folder
router.get("/:id/cardsets", getFolderCardSets);

export default router;
