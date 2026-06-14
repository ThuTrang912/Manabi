import React from "react";
import TopBar from "../components/TopBar";
import { useNavigate } from "react-router-dom";

export default function DictionaryPage() {
  const navigate = useNavigate();

  const [dictionaries, setDictionaries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [sortLabel, setSortLabel] = React.useState("Tên");

  const sortOptions = ["Tên", "Số từ", "Gần đây"];

  const sortDictionaries = (dicts, sortType) => {
    const sorted = [...dicts].sort((a, b) => {
      switch (sortType) {
        case "Tên":
          return a.name.localeCompare(b.name);
        case "Số từ":
          return (b.wordCount || 0) - (a.wordCount || 0);
        case "Gần đây":
          return (b.updatedAt ? new Date(b.updatedAt) : new Date(0)) - 
                 (a.updatedAt ? new Date(a.updatedAt) : new Date(0));
        default:
          return 0;
      }
    });
    return sorted;
  };

  const filteredDictionaries = dictionaries.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedDictionaries = sortDictionaries(filteredDictionaries, sortLabel);

  React.useEffect(() => {
    fetchDictionaries();
  }, []);

  const fetchDictionaries = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:5001/api/dictionary/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDictionaries(data.dictionaries || []);
      } else {
        console.error("Failed to fetch dictionaries:", response.status);
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error);
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
        <h1 className="text-2xl font-bold mb-4">Từ điển</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <button
              className="bg-gray-100 px-4 py-2 rounded text-gray-700 flex items-center gap-2"
              onClick={() => setShowSortDropdown((v) => !v)}
            >
              {sortLabel} <span className="material-icons text-base">expand_more</span>
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white rounded shadow border z-10">
                {sortOptions.map((option) => (
                  <div
                    key={option}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      sortLabel === option ? "font-bold text-blue-600" : ""
                    }`}
                    onClick={() => {
                      setSortLabel(option);
                      setShowSortDropdown(false);
                    }}
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
              placeholder="Tìm kiếm từ điển"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-icons absolute right-2 top-2 text-gray-400">
              search
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="font-bold text-gray-600 mb-2">DANH SÁCH TỪ ĐIỂN</div>
          {loading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedDictionaries.map((dict) => (
                <div
                  key={dict.id}
                  className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => navigate(`/dictionary/${dict.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-normal">
                          {dict.wordCount || 0} từ
                        </span>
                        {dict.language && (
                          <span className="text-xs px-2 py-1 rounded font-normal bg-blue-100 text-blue-700">
                            {dict.language}
                          </span>
                        )}
                      </div>
                      <span className="ml-0">{dict.name}</span>
                      {dict.description && (
                        <div className="text-sm text-gray-500 font-normal mt-1">
                          {dict.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dictionary/${dict.id}/search`);
                        }}
                      >
                        Tra cứu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sortedDictionaries.length === 0 && !loading && (
                <div className="text-gray-500 text-center py-8">
                  {search ? "Không tìm thấy từ điển nào" : "Chưa có từ điển nào"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
