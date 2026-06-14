import Folder from "../models/Folder.js";
import CardSet from "../models/CardSet.js";

// GET /api/folders?sort=createdAt|name&order=asc|desc
export const getFoldersByUser = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware
    const { sort = "createdAt", order = "desc" } = req.query;
    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;
    const folders = await Folder.find({ userId }).sort(sortObj);
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/folders/:id
export const getFolderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/folders
export const createFolder = async (req, res) => {
  try {
    console.log("Create folder request received");
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);

    const userId = req.user.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    console.log("Creating folder with:", { name, description, userId });

    const folder = new Folder({
      name,
      description,
      userId,
      cardSetCount: 0,
    });

    await folder.save();
    console.log("Folder created successfully:", folder);
    res.status(201).json(folder);
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/folders/:id
export const updateFolder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      { name, description },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/folders/:id
export const deleteFolder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const folder = await Folder.findOneAndDelete({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json({ message: "Folder deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/folders/:id/cardsets
export const getFolderCardSets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify folder exists and belongs to user
    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Get card sets in this folder
    const cardSets = await CardSet.find({ folderId: id, userId });
    res.json({ cardSets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
