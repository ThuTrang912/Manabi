import React from "react";
import manabiLogo from '../assets/manabi-logo.png';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';
import Sidebar from "./Sidebar";

export default function TopBar({ navigate }) {
  // Lấy thông tin user từ JWT token trong localStorage
  let avatarUrl = "";
  let userName = "";
  let userEmail = "";
  const token = localStorage.getItem("auth_token");
  if (token) {
    try {
      const base64 = token.split('.')[1];
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const payload = JSON.parse(jsonStr);
      userName = payload.name || "";
      userEmail = payload.email || "";
      const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName || userEmail) + "&background=cccccc&color=555555&size=96";
      avatarUrl = payload.avatar || defaultAvatar;
    } catch (e) {
      const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
      avatarUrl = defaultAvatar;
      userName = "";
      userEmail = "";
    }
  } else {
    const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
    avatarUrl = defaultAvatar;
  }
  // UI state
  const [showMenu, setShowMenu] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const menuRef = React.useRef();
  const [showFolderModal, setShowFolderModal] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  return (
    <header className="flex items-center px-6 py-4 bg-white shadow-sm relative">
      {/* Hamburger menu button */}
      <button className="mr-2 text-2xl text-blue-500 focus:outline-none flex items-center justify-center" onClick={() => window.openSidebar && window.openSidebar()}>
        <Bars3Icon className="w-8 h-8 text-blue-500" />
      </button>
      {/* Sidebar component, state managed internally */}
      <Sidebar navigate={navigate} />
      {/* Logo button */}
      <button className="mr-2 focus:outline-none flex items-center justify-center" onClick={() => navigate("/")}> 
        <img src={manabiLogo} alt="Manabi Logo" style={{width: '100px', height: '60px', objectFit: 'contain'}} />
      </button>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Tìm kiếm bài kiểm tra thử"
          className="w-full px-4 py-2 rounded bg-gray-100 focus:outline-none"
        />
      </div>
      <div className="ml-4 relative">
        <button className="px-4 py-2 bg-yellow-400 text-white rounded-full font-semibold hover:bg-yellow-500 transition" onClick={() => setShowAdd(v => !v)}>
          + Tạo mới
        </button>
        {showAdd && (
          <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg border z-50 py-2 transition-all duration-200 ease-out" style={{transform: 'translateY(-10px)', opacity: 1, pointerEvents: 'auto'}}>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false);}}>
              <span className="material-icons">library_books</span> Học phần
            </button>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false); setShowFolderModal(true);}}>
              <span className="material-icons">folder</span> Thư mục
            </button>
          </div>
        )}
      {/* Modal tạo thư mục */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] flex flex-col items-center relative">
            <span className="material-icons text-5xl text-gray-500 mb-4">folder</span>
            <input
              type="text"
              className="w-full text-center text-lg font-semibold mb-6 px-4 py-2 bg-gray-100 rounded focus:outline-none"
              placeholder="Đặt tên cho thư mục của bạn"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
            />
            <div className="flex gap-4 mt-2">
              <button className="px-6 py-2 rounded bg-gray-100 text-gray-600 font-semibold" onClick={() => { setShowFolderModal(false); setFolderName(""); }}>Hủy</button>
              <button
                className={`px-6 py-2 rounded font-semibold ${folderName ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!folderName}
                onClick={() => {
                  // Tạo folder object với id và tên, chuyển hướng sang màn hình folder
                  const folderId = Date.now().toString(); // Tạo id đơn giản
                  setShowFolderModal(false);
                  setFolderName("");
                  navigate(`/folder/${folderId}`, { state: { folderName } });
                }}
              >Tạo</button>
            </div>
          </div>
        </div>
      )}
      </div>
      <div className="ml-4 relative">
        <div ref={menuRef} className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer" onClick={() => setShowMenu(v => !v)}>
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        </div>
        {showMenu && (
          <UserMenu
            avatarUrl={avatarUrl}
            userName={userName}
            userEmail={userEmail}
            setShowMenu={setShowMenu}
          />
        )}
      </div>
    </header>
  );
}
