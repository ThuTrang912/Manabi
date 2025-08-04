import Folder from "../models/Folder.js";

// GET /api/folders?userId=xxx&sort=createdAt|name&order=asc|desc
export const getFoldersByUser = async (req, res) => {
  try {
    const { userId, sort = "createdAt", order = "desc" } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;
    const folders = await Folder.find({ userId }).sort(sortObj);
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
