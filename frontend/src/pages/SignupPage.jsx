import React, { useState } from "react";
import { API_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    year: "",
    month: "",
    day: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.agree) {
      setError("Bạn phải đồng ý với điều khoản và chính sách.");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        email: form.email,
        name: form.username,
        password: form.password,
        birthday: form.year && form.month && form.day
          ? `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`
          : undefined,
      });
      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
        navigate("/homepage", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Bên trái */}
      <div className="flex-1 flex flex-col justify-center items-center bg-blue-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
          最高の勉強法です。無料で新規登録してください。
        </h2>
        <div className="w-64 h-40 bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white text-3xl font-bold">📚🎧</span>
        </div>
      </div>
      {/* Bên phải */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white shadow-lg px-8 relative">
        {/* Nút chuyển trang cố định */}
        <div className="absolute top-6 left-8 flex flex-row-reverse gap-0 w-[340px]">
          <button type="button" className="flex-1 py-2 border-b-2 border-indigo-600 font-bold text-indigo-600 bg-white" disabled>新規登録</button>
          <button type="button" className="flex-1 py-2 border-b-2 border-transparent text-gray-400 bg-white" onClick={()=>navigate("/")}>ログイン</button>
        </div>
        <form className="w-full max-w-md pt-14" onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-4">
            <select name="year" value={form.year} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="">年</option>
              {[...Array(100)].map((_,i)=>{
                const y = 2025-i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <select name="month" value={form.month} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="">月</option>
              {[...Array(12)].map((_,i)=>(<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
            <select name="day" value={form.day} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="">日</option>
              {[...Array(31)].map((_,i)=>(<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
          </div>
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="ユーザー名"
            className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="mb-2 flex items-center">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mr-2" />
            <span>私はManabiのサービス利用規約とプライバシーポリシーに同意します</span>
          </div>
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition mb-2">
            新規登録
          </button>
          <div className="text-center text-sm mt-2">
            すでにQuizletのアカウントをお持ちですか？
            <button type="button" className="text-indigo-600 hover:underline ml-1" onClick={()=>navigate("/")}>ログインする</button>
          </div>
        </form>
      </div>
    </div>
  );
}
