
import React from "react";
import TopBar from "../components/TopBar";
import {useNavigate } from "react-router-dom";

export default function LibraryPage() {
  const navigate = useNavigate();
  console.log("LibraryPage navigate:", typeof navigate, navigate);
  
  // State for card sets from API
  const [cardSets, setCardSets] = React.useState([]);
  const [folders, setFolders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [foldersLoading, setFoldersLoading] = React.useState(true);
  
  // Tab and search state
  const [tab, setTab] = React.useState("set");
  const [search, setSearch] = React.useState("");
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [sortLabel, setSortLabel] = React.useState("Đã tạo");
  const folderSortOptions = ["Đã đánh dấu", "Đã tạo", "Gần đây", "Đã học"];
  const cardSetSortOptions = ["Đã tạo", "Gần đây", "Đã học"];
  
  // Sorting functions
  const sortCardSets = (cardSets, sortType) => {
    const sorted = [...cardSets].sort((a, b) => {
      switch (sortType) {
        case "Đã tạo":
          return new Date(b.createdAt || b.metadata?.createdAt) - new Date(a.createdAt || a.metadata?.createdAt);
        case "Gần đây":
          return new Date(b.updatedAt || b.metadata?.updatedAt || b.createdAt) - new Date(a.updatedAt || a.metadata?.updatedAt || a.createdAt);
        case "Đã học":
          return (b.metadata?.lastStudied ? new Date(b.metadata.lastStudied) : new Date(0)) - 
                 (a.metadata?.lastStudied ? new Date(a.metadata.lastStudied) : new Date(0));
        default:
          return 0;
      }
    });
    return sorted;
  };

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
  
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCardSets = cardSets.filter(cs => cs.name.toLowerCase().includes(search.toLowerCase()));
  
  // Apply sorting
  const sortedCardSets = sortCardSets(filteredCardSets, sortLabel);
  const sortedFolders = sortFolders(filteredFolders, sortLabel);

  // Fetch card sets and folders from API
  React.useEffect(() => {
    fetchCardSets();
    fetchFolders();
  }, []);

  // Reset sort label when switching tabs
  React.useEffect(() => {
    setSortLabel("Đã tạo");
  }, [tab]);

  const fetchCardSets = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:5001/api/cards/sets", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCardSets(data.cardSets || []);
      }
    } catch (error) {
      console.error("Error fetching card sets:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold mb-4">Thư viện của bạn</h1>
        <div className="flex gap-6 mb-4 border-b pb-2">
          <button
            className={`px-2 pb-1 ${tab === "set" ? "font-semibold border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setTab("set")}
          >Bộ thẻ</button>
          <button
            className={`px-2 pb-1 ${tab === "folder" ? "font-semibold border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setTab("folder")}
          >Thư mục</button>
        </div>
        {tab === "set" ? (
          <>
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
                    {(tab === "set" ? cardSetSortOptions : folderSortOptions).map(option => (
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
                  placeholder="Tìm kiếm bộ thẻ"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <span className="material-icons absolute right-2 top-2 text-gray-400">search</span>
              </div>
            </div>
            <div className="mb-8">
              <div className="font-bold text-gray-600 mb-2">BỘ THẺ CỦA BẠN</div>
              {loading ? (
                <div className="text-gray-500">Đang tải...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sortedCardSets.map((cardSet) => {
                    return (
                      <div 
                        key={cardSet._id} 
                        className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => navigate(`/cardset/${cardSet._id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-normal">
                                {cardSet.stats.totalCards} thuật ngữ
                              </span>
                              {cardSet.source !== "manual" && (
                                <span className={`text-xs px-2 py-1 rounded font-normal ${
                                  cardSet.source === "quizlet" 
                                    ? "bg-blue-100 text-blue-700" 
                                    : cardSet.source === "anki"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {cardSet.source === "quizlet" ? "Quizlet" : 
                                   cardSet.source === "anki" ? "Anki" : 
                                   cardSet.source === "import" ? "Import" : 
                                   cardSet.source.charAt(0).toUpperCase() + cardSet.source.slice(1)}
                                </span>
                              )}
                              {(sortLabel === "Đã tạo" || sortLabel === "Gần đây") && (
                                <span className="text-xs text-gray-400 font-normal">
                                  {sortLabel === "Đã tạo" 
                                    ? new Date(cardSet.createdAt || cardSet.metadata?.createdAt).toLocaleDateString('vi-VN')
                                    : new Date(cardSet.updatedAt || cardSet.metadata?.updatedAt || cardSet.createdAt).toLocaleDateString('vi-VN')
                                  }
                                </span>
                              )}
                            </div>
                            <span className="ml-0">{cardSet.name}</span>
                            {cardSet.description && (
                              <div className="text-sm text-gray-500 font-normal mt-1">
                                {cardSet.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/cardset/${cardSet._id}/study`);
                              }}
                            >
                              Học
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {sortedCardSets.length === 0 && !loading && (
                    <div className="text-gray-500 text-center py-8">
                      {search ? "Không tìm thấy bộ thẻ nào" : "Chưa có bộ thẻ nào. Hãy tạo mới hoặc import từ Quizlet/Anki!"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
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
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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
                    {search ? "Không tìm thấy thư mục nào" : "Chưa có thư mục nào. Hãy tạo thư mục để sắp xếp bộ thẻ!"}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
