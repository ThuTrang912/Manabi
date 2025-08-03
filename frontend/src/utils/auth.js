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
      const defaultAvatar =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(user.userName || user.userEmail) +
        "&background=cccccc&color=555555&size=96";
      user.avatarUrl = payload.avatar || defaultAvatar;
    } catch {}
  }
  return user;
}
