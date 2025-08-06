import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';


export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for card sets from API
  const [cardSets, setCardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      navigate("/homepage", { replace: true });
    }
    
    // Get current user ID from token
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      try {
        const base64 = authToken.split('.')[1];
        const jsonStr = decodeURIComponent(escape(atob(base64)));
        const payload = JSON.parse(jsonStr);
        setCurrentUserId(payload._id || payload.id || payload.userId || "");
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
    
    // Fetch card sets
    fetchCardSets();
  }, [location, navigate]);

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
          {loading ? (
            <div className="text-gray-500">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cardSets.map((cardSet) => (
                <div 
                  key={cardSet._id} 
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate(`/cardset/${cardSet._id}`)}
                >
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <span className="material-icons">menu_book</span> 
                    {cardSet.source === "manual" ? "Học phần" : "Imported"}
                  </div>
                  <div className="font-semibold text-gray-700 truncate" title={cardSet.name}>
                    {cardSet.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {cardSet.stats.totalCards} terms · Tác giả: {cardSet.userId === currentUserId ? "bạn" : "khác"}
                  </div>
                  {cardSet.source !== "manual" && (
                    <div className="text-xs text-gray-400">
                      Từ {cardSet.source === "quizlet" ? "Quizlet" : cardSet.source === "anki" ? "Anki" : "Import"}
                    </div>
                  )}
                </div>
              ))}
              {cardSets.length === 0 && !loading && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Chưa có bộ thẻ nào. Hãy tạo mới hoặc import từ Quizlet/Anki!
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
