import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Đăng ký bằng email
const registerWithEmail = async (req, res) => {
  try {
    const { email, password, name, birthday } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã được sử dụng." });
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Tạo user mới
    // Nếu client không gửi avatar, dùng avatar mặc định
    const defaultAvatar =
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(name || email) +
      "&background=cccccc&color=555555&size=96";
    const user = new User({
      email,
      passwordHash,
      name,
      birthday,
      avatar: req.body.avatar || defaultAvatar,
    });
    await user.save();
    // Tạo JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .status(201)
      .json({
        token,
        user: { _id: user._id, email: user.email, name: user.name },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đăng nhập bằng email
const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email không tồn tại" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export default {
  registerWithEmail,
  loginWithEmail,
};
