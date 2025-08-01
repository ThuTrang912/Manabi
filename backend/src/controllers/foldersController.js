import Folder from "../models/Folder.js";

// Tạo mới folder
export const createFolder = async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ message: "Thiếu tên thư mục hoặc userId" });
    }
    const folder = new Folder({ name, userId });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy folder theo id
export const getFolderById = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Không tìm thấy thư mục" });
    }
    res.json(folder);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
