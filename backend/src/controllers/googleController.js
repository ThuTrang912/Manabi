import axios from "axios";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Thiếu mã code từ Google. Không thể xác thực." });
    }
    // Lấy access_token từ Google
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    });
    const access_token = tokenRes.data.access_token;
    // Lấy thông tin user từ Google
    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const { email, name, picture, id: googleId } = userRes.data;
    // Tìm hoặc tạo user trong MongoDB
    let user = await User.findOne({ email });
    const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || email) + "&background=cccccc&color=555555&size=96";
    if (!user) {
      user = new User({ email, name, avatar: picture || defaultAvatar, googleId });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.avatar = picture || user.avatar || defaultAvatar;
      await user.save();
    }
    // Lấy lại user từ database để đảm bảo trường avatar đã được cập nhật
    user = await User.findOne({ email });
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Redirect về frontend kèm token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    // Đảm bảo lấy lại user từ database sau khi cập nhật
    user = await User.findOne({ email });
    res.redirect(`${frontendUrl}/homepage?token=${token}`);
  } catch (err) {
    if (err.response) {
      console.error("Google OAuth error response:", err.response.data);
      res.status(500).json({
        message: "Google login error",
        error: err.response.data
      });
    } else {
      console.error("Google OAuth error:", err.message);
      res.status(500).json({
        message: "Google login error",
        error: err.message
      });
    }
  }
};
