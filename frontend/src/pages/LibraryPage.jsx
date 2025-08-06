
import React from "react";
import TopBar from "../components/TopBar";
import {useNavigate } from "react-router-dom";

export default function LibraryPage() {
  const navigate = useNavigate();
  console.log("LibraryPage navigate:", typeof navigate, navigate);
  
  // State for card sets from API
  const [cardSets, setCardSets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Dummy data for demonstration (will be replaced with API data)
  const progressSets = [
    { terms: 15, name: "(Bản nháp) Từ vựng tiếng anh p30(. 3000 từ thông dụng nhất) IELTS" },
    { terms: 842, name: "(Bản nháp) かきくけこ" },
    { terms: 323, name: "(Bản nháp) あいうえお" },
    { terms: 112, name: "(Bản nháp) だでど" },
    { terms: 349, name: "(Bản nháp) かきくけこ" },
    { terms: 441, name: "(Bản nháp) あいうえお" },
    { terms: 187, name: "(Bản nháp) かきくけこ" },
  ];
  const weekSets = [
    { terms: 4, user: "thu_trang912", name: "test học phần" }
  ];
  
  // Dummy folder data
  const [tab, setTab] = React.useState("set");
  const [folderSearch, setFolderSearch] = React.useState("");
  const folders = [
    { name: "Test", count: 2 },
    { name: "Arduino", count: 0 },
    { name: "3000 từ tiếng anh thông dụng", count: 30 },
    { name: "1", count: 15 },
    { name: "2", count: 14 },
  ];
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(folderSearch.toLowerCase()));

  // Dropdown state for sort
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [sortLabel, setSortLabel] = React.useState("Đã tạo");
  const folderSortOptions = ["Đã đánh dấu", "Đã tạo", "Gần đây", "Đã học"];
  const cardSetSortOptions = ["Đã tạo", "Gần đây", "Đã học"];

  // Fetch card sets from API
  React.useEffect(() => {
    fetchCardSets();
  }, []);

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
      <TopBar navigate={navigate} />
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
                    {cardSetSortOptions.map(option => (
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
                  placeholder="Tìm kiếm thẻ ghi nhớ"
                  value={folderSearch}
                  onChange={e => setFolderSearch(e.target.value)}
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
                  {cardSets.map((cardSet) => {
                    // Debug: log the source value
                    console.log(`Card set "${cardSet.name}" has source: "${cardSet.source}"`);
                    
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
                  {cardSets.length === 0 && !loading && (
                    <div className="text-gray-500 text-center py-8">
                      Chưa có bộ thẻ nào. Hãy tạo mới hoặc import từ Quizlet/Anki!
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mb-8">
              <div className="font-bold text-gray-600 mb-2">TIẾN TRÌNH</div>
              <div className="flex flex-col gap-2">
                {progressSets.map((set, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => navigate(`/cardset/${set.id || idx}/study`)}
                  >
                    <span className="text-xs text-gray-500 font-normal">{set.terms} thuật ngữ</span> <span className="ml-2">{set.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <div className="font-bold text-gray-600 mb-2">TUẦN NÀY</div>
              <div className="flex flex-col gap-2">
                {weekSets.map((set, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => navigate(`/cardset/${set.id || idx}/study`)}
                  >
                    <span className="text-xs text-gray-500 font-normal">{set.terms} thuật ngữ</span>
                    <span className="text-xs text-gray-400 font-normal">by {set.user}</span>
                    <span className="ml-2">{set.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-600 mb-2">THÁNG 7 NĂM 2025</div>
              {/* Thêm dữ liệu tháng nếu cần */}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
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
            <div className="flex flex-col gap-4">
              {filteredFolders.map((folder, idx) => (
                <div key={idx} className="bg-white rounded-lg px-6 py-4 shadow border flex items-center gap-4">
                  <div className="text-sm text-gray-500 w-16">{folder.count} mục</div>
                  <span className="material-icons text-2xl text-gray-400">folder</span>
                  <span className="font-bold text-lg text-gray-800">{folder.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
