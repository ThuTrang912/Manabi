import QuizletIntegrationService from "../services/QuizletIntegrationService.js";
import AnkiIntegrationService from "../services/AnkiIntegrationService.js";
import SimpleImportService from "../services/SimpleImportService.js";
import CardSet from "../models/CardSet.js";
import Card from "../models/Card.js";
import StarredCard from "../models/StarredCard.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".apkg", ".txt", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .apkg, .txt, and .csv files are allowed"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Import from Quizlet URL (updated to handle errors gracefully)
export const importFromQuizlet = async (req, res) => {
  try {
    const { url, csvText, jsonText, customName } = req.body;
    const userId = req.user.userId; // From JWT middleware

    console.log("=== IMPORT DEBUG START ===");
    console.log("Raw request body:", req.body);
    console.log("Extracted values:", {
      hasUrl: !!url,
      hasCsvText: !!csvText,
      hasJsonText: !!jsonText,
      customName: `"${customName}"`,
      customNameType: typeof customName,
    });

    // Try different import methods
    let result;

    if (csvText) {
      // Import from CSV text
      console.log("Processing CSV import with customName:", customName);
      console.log("customName type:", typeof customName);
      console.log("customName length:", customName?.length);
      console.log("customName truthy:", !!customName);
      console.log(
        "customName && customName.trim():",
        !!(customName && customName.trim())
      );

      const setName =
        customName && customName.trim()
          ? customName.trim()
          : `Imported from CSV - ${new Date().toLocaleString()}`;
      console.log("CSV setName selected:", setName);
      result = await SimpleImportService.importFromCsvText(
        csvText,
        userId,
        setName,
        "quizlet"
      );
    } else if (jsonText) {
      // Import from JSON text - pass customName to be used as set name
      console.log("Processing JSON import with customName:", customName);
      result = await SimpleImportService.importFromQuizletJson(
        jsonText,
        userId,
        "quizlet",
        customName && customName.trim() ? customName.trim() : null
      );
    } else if (url) {
      // Try original Quizlet import (may fail due to blocking)
      try {
        result = await QuizletIntegrationService.importFromQuizletUrl(
          url,
          userId,
          customName // Pass customName to QuizletIntegrationService
        );
      } catch (error) {
        // If Quizlet import fails, provide alternative
        return res.status(400).json({
          message:
            "Quizlet import không khả dụng do bảo mật. Vui lòng sử dụng CSV hoặc JSON import.",
          error:
            "Quizlet blocks automated access. Please copy and paste the data as CSV or JSON.",
          alternative:
            "Bạn có thể copy/paste dữ liệu dưới dạng CSV (Front,Back) hoặc JSON.",
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "URL, CSV text, or JSON text is required" });
    }

    console.log("=== IMPORT RESULT ===");
    console.log("Final result:", {
      cardSetName: result.cardSet?.name,
      cardSetId: result.cardSet?._id,
      cardsCount: result.cardsCount,
    });
    console.log("=== IMPORT DEBUG END ===");

    res.json({
      message: "Successfully imported cards",
      cardSet: result.cardSet,
      cardsImported: result.cardsCount,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      message: "Failed to import",
      error: error.message,
    });
  }
};

// Import from Anki file
export const importFromAnki = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    console.log("Anki import request:", {
      hasFile: !!file,
      deckName: req.body.deckName,
      bodyKeys: Object.keys(req.body),
    });

    if (!file) {
      return res.status(400).json({ message: "Anki file is required" });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let result;

    if (ext === ".apkg") {
      result = await AnkiIntegrationService.importFromAnkiPackage(
        file.path,
        userId
      );
    } else if (ext === ".txt") {
      const deckName =
        req.body.deckName || path.basename(file.originalname, ext);
      result = await AnkiIntegrationService.importFromAnkiText(
        file.path,
        userId,
        deckName
      );
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    // Clean up uploaded file
    // fs.unlinkSync(file.path);

    res.json({
      message: "Successfully imported from Anki",
      ...result,
    });
  } catch (error) {
    console.error("Anki import error:", error);
    res.status(500).json({
      message: "Failed to import from Anki",
      error: error.message,
    });
  }
};

// Export to Anki format
export const exportToAnki = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    const result = await AnkiIntegrationService.exportToAnkiText(cardSetId);

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );
    res.send(result.content);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      message: "Failed to export",
      error: error.message,
    });
  }
};

// Get all card sets with import info
export const getCardSets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { source, limit = 20, page = 1 } = req.query;

    const filter = { userId };
    if (source) {
      filter.source = source;
    }

    const cardSets = await CardSet.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("folderId", "name");

    const total = await CardSet.countDocuments(filter);

    res.json({
      cardSets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get card sets error:", error);
    res.status(500).json({
      message: "Failed to get card sets",
      error: error.message,
    });
  }
};

// Get single card set by ID
export const getCardSet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cardSetId } = req.params;

    console.log("🔍 getCardSet DEBUG:", {
      requestedCardSetId: cardSetId,
      userId: userId,
      userObject: req.user,
    });

    const cardSet = await CardSet.findOne({
      _id: cardSetId,
      userId: userId,
    }).populate("folderId", "name");

    console.log("🔍 Database query result:", {
      found: !!cardSet,
      cardSetData: cardSet
        ? {
            id: cardSet._id,
            name: cardSet.name,
            userId: cardSet.userId,
            userIdMatch: cardSet.userId.toString() === userId.toString(),
          }
        : null,
    });

    if (!cardSet) {
      // Try to find cardset without userId filter to debug
      const anyCardSet = await CardSet.findById(cardSetId);
      console.log("🔍 CardSet exists without userId filter:", {
        exists: !!anyCardSet,
        actualUserId: anyCardSet?.userId,
        requestUserId: userId,
        match: anyCardSet?.userId.toString() === userId.toString(),
      });

      return res.status(404).json({
        message: "Card set not found",
        debug: {
          cardSetId,
          userId,
          found: !!anyCardSet,
          actualUserId: anyCardSet?.userId,
        },
      });
    }

    console.log("✅ Returning cardSet:", cardSet.name);
    res.json(cardSet);
  } catch (error) {
    console.error("Get card set error:", error);
    res.status(500).json({
      message: "Failed to get card set",
      error: error.message,
    });
  }
};

// Toggle star for a card (user-specific)
export const toggleStarCard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const existing = await StarredCard.findOne({ userId, cardId });
    if (existing) {
      await StarredCard.deleteOne({ _id: existing._id });
      return res.json({ starred: false });
    }
    await StarredCard.create({ userId, cardId, cardSetId: card.cardSetId });
    res.json({ starred: true });
  } catch (e) {
    console.error("Toggle star error:", e);
    res
      .status(500)
      .json({ message: "Failed to toggle star", error: e.message });
  }
};

// Get starred card ids for a user in a set
export const getStarredCards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cardSetId } = req.params;
    const stars = await StarredCard.find({ userId, cardSetId }).select(
      "cardId"
    );
    res.json({ cardIds: stars.map((s) => s.cardId) });
  } catch (e) {
    console.error("Get starred error:", e);
    res
      .status(500)
      .json({ message: "Failed to get starred", error: e.message });
  }
};

// Get cards from a set
export const getCards = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const userId = req.user.userId;
    const { limit = 50, page = 1 } = req.query;

    // Verify ownership
    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    const cards = await Card.find({ cardSetId })
      .sort({ position: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Card.countDocuments({ cardSetId });

    res.json({
      cardSet,
      cards,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get cards error:", error);
    res.status(500).json({
      message: "Failed to get cards",
      error: error.message,
    });
  }
};

// Sync with external source
export const syncWithSource = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const userId = req.user.userId;

    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    if (cardSet.source === "manual") {
      return res
        .status(400)
        .json({ message: "Cannot sync manually created sets" });
    }

    let result;
    if (cardSet.source === "quizlet") {
      result = await QuizletIntegrationService.syncWithQuizlet(cardSetId);
    } else {
      return res
        .status(400)
        .json({ message: "Sync not supported for this source" });
    }

    res.json({
      message: "Successfully synced with source",
      ...result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      message: "Failed to sync",
      error: error.message,
    });
  }
};

// Create a new card in a card set
export const createCard = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const { frontFields, backFields } = req.body;
    const userId = req.user.userId;

    // Verify card set ownership
    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    // Validate required fields
    if (!frontFields || !frontFields.length || !frontFields[0].value) {
      return res.status(400).json({ message: "Front text is required" });
    }

    if (!backFields || !backFields.length || !backFields[0].value) {
      return res.status(400).json({ message: "Back text is required" });
    }

    // Get the position for the new card
    const lastCard = await Card.findOne({ cardSetId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    // Combine multiple fields for front and back
    const frontText = frontFields
      .map((field) => field.value)
      .filter((v) => v.trim())
      .join(" | ");
    const backText = backFields
      .map((field) => field.value)
      .filter((v) => v.trim())
      .join(" | ");

    // Create the card
    const card = new Card({
      cardSetId,
      position,
      content: {
        front: {
          text: frontText,
          image: "",
          audio: "",
          html: "",
        },
        back: {
          text: backText,
          image: "",
          audio: "",
          html: "",
        },
      },
      // Default learning state
      learning: {
        status: "new",
        lastReviewed: null,
        nextReview: new Date(),
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        streak: 0,
      },
      tags: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 0,
        quality: 0,
      },
    });

    await card.save();

    // Update card set stats
    await CardSet.findByIdAndUpdate(cardSetId, {
      $inc: { "stats.totalCards": 1 },
      $set: { "metadata.updatedAt": new Date() },
    });

    res.status(201).json({
      message: "Card created successfully",
      card,
    });
  } catch (error) {
    console.error("Create card error:", error);
    res.status(500).json({
      message: "Failed to create card",
      error: error.message,
    });
  }
};

// Create multiple cards at once
export const createMultipleCards = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const { cards } = req.body; // Array of card data
    const userId = req.user.userId;

    // Verify card set ownership
    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    if (!cards || !cards.length) {
      return res.status(400).json({ message: "Cards array is required" });
    }

    // Get starting position
    const lastCard = await Card.findOne({ cardSetId }).sort({ position: -1 });
    let position = lastCard ? lastCard.position + 1 : 0;

    const cardDocuments = [];

    for (const cardData of cards) {
      const { frontFields, backFields } = cardData;

      if (!frontFields || !frontFields.length || !frontFields[0].value) {
        continue; // Skip invalid cards
      }

      if (!backFields || !backFields.length || !backFields[0].value) {
        continue; // Skip invalid cards
      }

      const frontText = frontFields
        .map((field) => field.value)
        .filter((v) => v.trim())
        .join(" | ");
      const backText = backFields
        .map((field) => field.value)
        .filter((v) => v.trim())
        .join(" | ");

      cardDocuments.push({
        cardSetId,
        position: position++,
        content: {
          front: {
            text: frontText,
            image: "",
            audio: "",
            html: "",
          },
          back: {
            text: backText,
            image: "",
            audio: "",
            html: "",
          },
        },
        learning: {
          status: "new",
          lastReviewed: null,
          nextReview: new Date(),
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          streak: 0,
        },
        tags: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          difficulty: 0,
          quality: 0,
        },
      });
    }

    if (cardDocuments.length === 0) {
      return res.status(400).json({ message: "No valid cards to create" });
    }

    // Insert all cards
    const insertedCards = await Card.insertMany(cardDocuments);

    // Update card set stats
    await CardSet.findByIdAndUpdate(cardSetId, {
      $inc: { "stats.totalCards": insertedCards.length },
      $set: { "metadata.updatedAt": new Date() },
    });

    res.status(201).json({
      message: `Created ${insertedCards.length} cards successfully`,
      cards: insertedCards,
      count: insertedCards.length,
    });
  } catch (error) {
    console.error("Create multiple cards error:", error);
    res.status(500).json({
      message: "Failed to create cards",
      error: error.message,
    });
  }
};

// Create a new card set
export const createCardSet = async (req, res) => {
  try {
    const { name, description, folderId, source = "manual" } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Card set name is required" });
    }

    // Check if card set with same name already exists for this user
    const existingCardSet = await CardSet.findOne({
      name: name.trim(),
      userId,
    });

    if (existingCardSet) {
      return res.status(409).json({
        message: "Card set với tên này đã tồn tại",
        cardSet: existingCardSet,
      });
    }

    const cardSet = new CardSet({
      name: name.trim(),
      description: description || "",
      userId,
      folderId: folderId || null,
      source,
      sourceMetadata: {},
      stats: {
        totalCards: 0,
        studiedCards: 0,
        masteredCards: 0,
        averageScore: 0,
      },
      settings: {
        spacedRepetition: {
          enabled: true,
          algorithm: "SM-2",
          newCardsPerDay: 20,
          maxReviews: 200,
        },
        study: {
          showAnswerTimer: 10,
          autoPlay: false,
          shuffleCards: false,
        },
      },
      tags: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStudied: null,
        difficulty: "medium",
      },
    });

    await cardSet.save();

    res.status(201).json({
      message: "Card set created successfully",
      cardSet,
    });
  } catch (error) {
    console.error("Create card set error:", error);
    res.status(500).json({
      message: "Failed to create card set",
      error: error.message,
    });
  }
};

// Update an existing card set
export const updateCardSet = async (req, res) => {
  try {
    const { cardSetId } = req.params;
    const { name, description, folderId } = req.body;
    const userId = req.user.userId;

    // Verify ownership
    const cardSet = await CardSet.findOne({ _id: cardSetId, userId });
    if (!cardSet) {
      return res.status(404).json({ message: "Card set not found" });
    }

    // Check if new name conflicts with existing card set (excluding current one)
    if (name && name.trim() && name.trim() !== cardSet.name) {
      const existingCardSet = await CardSet.findOne({
        name: name.trim(),
        userId,
        _id: { $ne: cardSetId },
      });

      if (existingCardSet) {
        return res.status(409).json({
          message: "Card set với tên này đã tồn tại",
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (folderId !== undefined) updateData.folderId = folderId;
    updateData.updatedAt = new Date();

    const updatedCardSet = await CardSet.findByIdAndUpdate(
      cardSetId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Card set updated successfully",
      cardSet: updatedCardSet,
    });
  } catch (error) {
    console.error("Update card set error:", error);
    res.status(500).json({
      message: "Failed to update card set",
      error: error.message,
    });
  }
};

// Update individual card
export const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { frontFields, backFields } = req.body;
    const userId = req.user.userId;

    // Find the card first to verify ownership
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Verify card set ownership
    const cardSet = await CardSet.findOne({ _id: card.cardSetId, userId });
    if (!cardSet) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate required fields
    if (!frontFields || !frontFields.length || !frontFields[0].value) {
      return res.status(400).json({ message: "Front text is required" });
    }

    if (!backFields || !backFields.length || !backFields[0].value) {
      return res.status(400).json({ message: "Back text is required" });
    }

    // Combine multiple fields for front and back
    const frontText = frontFields
      .map((field) => field.value)
      .filter((v) => v.trim())
      .join(" | ");
    const backText = backFields
      .map((field) => field.value)
      .filter((v) => v.trim())
      .join(" | ");

    // Update the card
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      {
        content: {
          front: {
            text: frontText,
            image: card.content.front.image || "",
            audio: card.content.front.audio || "",
            html: card.content.front.html || "",
          },
          back: {
            text: backText,
            image: card.content.back.image || "",
            audio: card.content.back.audio || "",
            html: card.content.back.html || "",
          },
        },
        "metadata.updatedAt": new Date(),
      },
      { new: true }
    );

    res.json({
      message: "Card updated successfully",
      card: updatedCard,
    });
  } catch (error) {
    console.error("Update card error:", error);
    res.status(500).json({
      message: "Failed to update card",
      error: error.message,
    });
  }
};

// Delete individual card
export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;

    // Find the card first to verify ownership
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Verify card set ownership
    const cardSet = await CardSet.findOne({ _id: card.cardSetId, userId });
    if (!cardSet) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete the card
    await Card.findByIdAndDelete(cardId);

    // Update card set stats
    await CardSet.findByIdAndUpdate(card.cardSetId, {
      $inc: { "stats.totalCards": -1 },
      $set: { "metadata.updatedAt": new Date() },
    });

    res.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Delete card error:", error);
    res.status(500).json({
      message: "Failed to delete card",
      error: error.message,
    });
  }
};
