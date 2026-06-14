import React from "react";
import TopBar from "../components/TopBar";
import { useNavigate } from "react-router-dom";

export default function FoldersPage() {
  const navigate = useNavigate();
  
  // State for folders from API
  const [folders, setFolders] = React.useState([]);
  const [foldersLoading, setFoldersLoading] = React.useState(true);
  const [folderSearch, setFolderSearch] = React.useState("");
  
  // Dropdown state for sort
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [sortLabel, setSortLabel] = React.useState("Đã tạo");
  const folderSortOptions = ["Đã đánh dấu", "Đã tạo", "Gần đây", "Đã học"];

  // Sorting function
  const sortFolders = (folders, sortType) => {
    const sorted = [...folders].sort((a, b) => {
      switch (sortType) {
        case "Đã đánh dấu":
          return (b.isBookmarked ? 1 : 0) - (a.isBookmarked ? 1 : 0);
        case "Đã tạo":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "Gần đây":
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case "Đã học":
          return (b.lastStudied ? new Date(b.lastStudied) : new Date(0)) - 
                 (a.lastStudied ? new Date(a.lastStudied) : new Date(0));
        default:
          return 0;
      }
    });
    return sorted;
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(folderSearch.toLowerCase()));
  const sortedFolders = sortFolders(filteredFolders, sortLabel);

  // Fetch folders from API
  React.useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:5001/api/folders", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Folders response:", data); // Debug log
        setFolders(data || []); // Backend returns folders array directly
      } else {
        console.error("Failed to fetch folders:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setFoldersLoading(false);
    }
  };

  // Đóng dropdown khi click ngoài
  React.useEffect(() => {
    if (!showSortDropdown) return;
    const handle = (e) => {
      if (!e.target.closest('.relative')) setShowSortDropdown(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSortDropdown]);

  return (
    <>
      <TopBar navigate={navigate} onFolderCreated={fetchFolders} />
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Thư mục của bạn</h1>
          <button 
            className="text-blue-500 hover:text-blue-600 font-semibold"
            onClick={() => navigate('/library')}
          >
            ← Quay lại Bộ thẻ
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <button
              className="bg-gray-100 px-4 py-2 rounded text-gray-700 flex items-center gap-2"
              onClick={() => setShowSortDropdown(v => !v)}
            >
              {sortLabel} <span className="material-icons text-base">expand_more</span>
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white rounded shadow border z-10">
                {folderSortOptions.map(option => (
                  <div
                    key={option}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${sortLabel === option ? 'font-bold text-blue-600' : ''}`}
                    onClick={() => { setSortLabel(option); setShowSortDropdown(false); }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <input
              className="border rounded px-3 py-2 w-72"
              placeholder="Tìm kiếm thư mục"
              value={folderSearch}
              onChange={e => setFolderSearch(e.target.value)}
            />
            <span className="material-icons absolute right-2 top-2 text-gray-400">search</span>
          </div>
        </div>

        {foldersLoading ? (
          <div className="text-gray-500">Đang tải thư mục...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedFolders.length > 0 ? (
              sortedFolders.map((folder) => (
                <div 
                  key={folder._id} 
                  className="bg-white rounded-lg px-6 py-4 shadow border flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => navigate(`/folder/${folder._id}`)}
                >
                  <div className="text-sm text-gray-500 w-16">{folder.cardSetCount || 0} mục</div>
                  <span className="material-icons text-2xl text-gray-400">folder</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">{folder.name}</span>
                      {folder.isBookmarked && (
                        <span className="material-icons text-yellow-500 text-sm">star</span>
                      )}
                      {(sortLabel === "Đã tạo" || sortLabel === "Gần đây") && (
                        <span className="text-xs text-gray-400 font-normal">
                          {sortLabel === "Đã tạo" 
                            ? new Date(folder.createdAt).toLocaleDateString('vi-VN')
                            : new Date(folder.updatedAt || folder.createdAt).toLocaleDateString('vi-VN')
                          }
                        </span>
                      )}
                    </div>
                    {folder.description && (
                      <div className="text-sm text-gray-500 mt-1">{folder.description}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                {folderSearch ? "Không tìm thấy thư mục nào" : "Chưa có thư mục nào. Hãy tạo thư mục để sắp xếp bộ thẻ!"}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
