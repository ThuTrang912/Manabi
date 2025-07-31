import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';


export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      navigate("/homepage", { replace: true });
    }
  }, [location, navigate]);

  // UI state is now managed inside TopBar

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nút đăng xuất test ở ngoài menu avatar */}
      {/* <button
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
        onClick={() => {
          localStorage.removeItem('auth_token');
          window.location.replace('/');
        }}
      >
        Đăng xuất (Test)
      </button> */}
      {/* TopBar component */}
      <TopBar navigate={navigate} />

      <div className="flex flex-1">
        {/* Sidebar will be handled by TopBar's state, so you may need to lift state up if Sidebar needs to open from TopBar */}
        <Sidebar navigate={navigate} />
        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Quizlet iframe embed */}
          {/* <div className="mb-8">
            <iframe src="https://quizlet.com/469507067/match/embed?i=svf2q&x=1jj1" height="500" width="100%" style={{border:0}} title="Quizlet Match Game" />
          </div> */}
          <h2 className="text-lg font-semibold mb-4">Gần đây</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Card Example */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="material-icons">drafts</span> Bản nháp
              </div>
              <div className="font-semibold text-gray-700 truncate">Học phần chưa đặt tên</div>
              <div className="text-xs text-gray-500">842 terms · Tác giả: bạn</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="material-icons">menu_book</span> Học phần
              </div>
              <div className="font-semibold text-gray-700 truncate">がぎぐげご</div>
              <div className="text-xs text-gray-500">42 terms · Tác giả: bạn</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="material-icons">menu_book</span> Học phần
              </div>
              <div className="font-semibold text-gray-700 truncate">さしすせそ</div>
              <div className="text-xs text-gray-500">383 terms · Tác giả: bạn</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="material-icons">menu_book</span> Học phần
              </div>
              <div className="font-semibold text-gray-700 truncate">かきくけこ</div>
              <div className="text-xs text-gray-500">842 terms · Tác giả: bạn</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="material-icons">menu_book</span> Học phần
              </div>
              <div className="font-semibold text-gray-700 truncate">あいうえお</div>
              <div className="text-xs text-gray-500">323 terms · Tác giả: bạn</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="material-icons">menu_book</span> Học phần
              </div>
              <div className="font-semibold text-gray-700 truncate">かきくけこ</div>
              <div className="text-xs text-gray-500">522 terms · Tác giả: bạn</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
