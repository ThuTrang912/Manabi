// utils/auth.js
export function getUserFromToken(tokenKey = "auth_token") {
  let user = { userName: "", userEmail: "", userId: "", avatarUrl: "" };
  const token = localStorage.getItem(tokenKey);
  if (token) {
    try {
      const base64 = token.split(".")[1];
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const payload = JSON.parse(jsonStr);
      user.userName = payload.name || "";
      user.userEmail = payload.email || "";
      user.userId = payload._id || payload.id || payload.userId || "";
      // Avatar đã được tạo sẵn từ backend, không cần tạo lại
      user.avatarUrl =
        payload.avatar ||
        "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
    } catch {}
  }
  return user;
}
