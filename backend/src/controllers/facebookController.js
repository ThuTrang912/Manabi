import axios from "axios";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const facebookCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Thiếu mã code từ Facebook. Không thể xác thực." });
    }
    // Lấy access_token từ Facebook
    const tokenRes = await axios.get("https://graph.facebook.com/v10.0/oauth/access_token", {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      }
    });
    const access_token = tokenRes.data.access_token;
    // Lấy thông tin user từ Facebook
    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token
      }
    });
    const { email, name, id: facebookId } = userRes.data;
    const picture = userRes.data.picture?.data?.url;
    // Tìm hoặc tạo user trong MongoDB
    let user = await User.findOne({ email });
    const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || email) + "&background=cccccc&color=555555&size=96";
    if (!user) {
      user = new User({ email, name, avatar: picture || defaultAvatar, facebookId });
      await user.save();
    } else {
      if (!user.facebookId) {
        user.facebookId = facebookId;
      }
      user.avatar = user.avatar || picture || defaultAvatar;
      await user.save();
    }
    // Tạo JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Redirect về frontend kèm token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    res.redirect(`${frontendUrl}/homepage?token=${token}`);
  } catch (err) {
    console.error("Facebook OAuth error response:", err.response?.data || err.message);
    res.status(500).json({ message: "Facebook login error", error: err.response?.data || err.message });
  }
};
