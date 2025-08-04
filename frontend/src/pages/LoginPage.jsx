import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu đã có token thì chuyển hướng về homepage
    if (localStorage.getItem("auth_token")) {
      navigate("/homepage", { replace: true });
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    const clientId = "224249829559-vpqlb3grqlubma8pfr134i30aaaof2r2.apps.googleusercontent.com";
    const redirectUri = `${API_URL}/auth/google/callback`;
    const scope = "email profile openid";
    const responseType = "code";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
    console.log(url);
    window.location.href = url;
  };

  const handleFacebookLogin = () => {
    const appId = "613241278127466"; // Thay bằng App ID thật của bạn
    const redirectUri = `${API_URL}/auth/facebook/callback`;
    const scope = "email,public_profile";
    const url = `https://www.facebook.com/v10.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;
    window.location.href = url;
  };


  const [error, setError] = useState("");
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("auth_token", data.token);
        navigate("/homepage", { replace: true });
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi server");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Bên trái */}
      <div className="flex-1 flex flex-col justify-center items-center bg-blue-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
          自宅でリラックスしながら、本格的に学べます。
        </h2>
        <div className="w-64 h-40 bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white text-3xl font-bold">📚🎧</span>
        </div>
      </div>
      {/* Bên phải */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white shadow-lg px-8 relative">
        {/* Nút chuyển trang cố định */}
        <div className="absolute top-6 left-8 flex flex-row-reverse gap-0 w-[340px]">
          <button className="flex-1 py-2 border-b-2 border-transparent text-gray-400 bg-white" onClick={() => navigate("/signup")}>新規登録</button>
          <button className="flex-1 py-2 border-b-2 border-indigo-600 font-bold text-indigo-600 bg-white" disabled>ログイン</button>
        </div>
        <div className="w-full max-w-md pt-14">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 mb-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <span className="text-red-500">G</span> Googleでログイン
          </button>
          <button
            onClick={handleFacebookLogin}
            className="w-full py-2 mb-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <span className="text-blue-600">f</span> Facebookでログイン
          </button>
          {/* Đã xóa nút đăng nhập với Apple */}
          <div className="text-center text-gray-400 mb-4">またはメールアドレスで</div>
          <form onSubmit={handleEmailLogin} className="w-full">
            <input
              type="email"
              placeholder="メールアドレス"
              className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="パスワード"
              className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition mb-2">
              ログイン
            </button>
            <div className="text-right">
              <a href="#" className="text-indigo-600 text-sm hover:underline">パスワードを忘れた場合</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}