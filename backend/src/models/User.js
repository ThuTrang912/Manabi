import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: String, // chỉ có nếu đăng ký bằng email
  googleId: String,     // chỉ có nếu đăng nhập Google
  facebookId: String,   // chỉ có nếu đăng nhập Facebook
  name: String,
  avatar: String,
  birthday: String,     // yyyy-mm-dd
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
