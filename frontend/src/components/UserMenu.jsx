import React from "react";

export default function UserMenu({ avatarUrl, userName, userEmail, setShowMenu }) {
  return (
    <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border z-50 p-4 transition-all duration-200 ease-out" style={{transform: 'translateY(-10px)', opacity: 1, pointerEvents: 'auto'}}>
      
      <div className="flex items-center gap-3 mb-2">
        <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-800 truncate max-w-[140px]" title={userName}>{userName}</div>
          <div className="text-sm text-gray-500 truncate max-w-[140px]" title={userEmail}>{userEmail}</div>
        </div>
      </div>
      <hr className="my-2" />
      <div className="flex flex-col gap-2">
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">emoji_events</span> Thành tựu</button>
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">settings</span> Cài đặt</button>
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">dark_mode</span> Tối</button>
        <button
          className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
          onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.replace('/');
          }}
        >
          <span className="material-icons">logout</span> Đăng xuất
        </button>
        <hr className="my-2" />
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">privacy_tip</span> Quyền riêng tư</button>
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">help_outline</span> Giúp đỡ và phản hồi</button>
        <button className="text-left py-2 px-3 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"><span className="material-icons">upgrade</span> Nâng cấp</button>
      </div>
    </div>
  );
}
