import express from "express";
import {
  importFromQuizlet,
  importFromAnki,
  exportToAnki,
  getCardSets,
  getCardSet,
  getCards,
  syncWithSource,
  createCard,
  createMultipleCards,
  createCardSet,
  updateCardSet,
  updateCard,
  deleteCard,
  upload,
} from "../controllers/cardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Import routes
router.post("/import/quizlet", importFromQuizlet);
router.post("/import/anki", upload.single("file"), importFromAnki);

// Export routes
router.get("/export/anki/:cardSetId", exportToAnki);

// Card set management
router.post("/sets", createCardSet);
router.get("/sets", getCardSets);
router.get("/sets/:cardSetId", getCardSet);
router.put("/sets/:cardSetId", updateCardSet);
router.get("/sets/:cardSetId/cards", getCards);
router.post("/sets/:cardSetId/sync", syncWithSource);

// Individual card management
router.post("/sets/:cardSetId/cards", createCard);
router.post("/sets/:cardSetId/cards/bulk", createMultipleCards);
router.put("/:cardId", updateCard);
router.delete("/:cardId", deleteCard);

export default router;
