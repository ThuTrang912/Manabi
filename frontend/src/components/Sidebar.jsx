import React from "react";

export default function Sidebar({ navigate }) {
  const [showSidebar, setShowSidebar] = React.useState(false);

  React.useEffect(() => {
    window.openSidebar = () => setShowSidebar(true);
    return () => { window.openSidebar = undefined; };
  }, []);

  if (!showSidebar) return null;
  return (
    <div className="fixed inset-0" style={{ zIndex: 2000 }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-30 transition-opacity duration-300"
        onClick={() => setShowSidebar(false)}
      />
      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 h-full w-64 bg-white border-r p-4 flex flex-col gap-2 shadow-lg transform transition-transform duration-300 translate-x-0"
        style={{ zIndex: 2100 }}
      >
        <button className="mb-4 text-gray-500 hover:text-blue-500 self-end" onClick={() => setShowSidebar(false)}>
          <span className="material-icons">close</span>
        </button>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">home</span> 
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setShowSidebar(false);
              if (navigate) navigate('/homepage');
            }}
          >
            Trang chủ
          </span>
        </div>
        <div
          className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
          onClick={() => {
            setShowSidebar(false);
            if (navigate) navigate('/sets');
          }}
        >
          <span className="material-icons">folder_open</span> Thư viện của bạn
        </div>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">notifications</span> Thông báo
        </div>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">folder</span> Thư mục của bạn
        </div>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">create_new_folder</span> Thư mục mới
        </div>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">note</span> Thẻ ghi nhớ
        </div>
        <div className="text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
          <span className="material-icons">question_answer</span> Lời giải chuyên ...
        </div>
      </aside>
    </div>
  );
}
