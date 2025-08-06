import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import AddCardModal from "../components/AddCardModal";

export default function CardSetPage() {
  const { cardSetId } = useParams();
  const navigate = useNavigate();
  
  const [cardSet, setCardSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  useEffect(() => {
    fetchCardSet();
  }, [cardSetId, currentPage]);

  const fetchCardSet = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards?page=${currentPage}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch card set");
      }

      const data = await response.json();
      setCardSet(data.cardSet);
      setCards(data.cards);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching card set:", error);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!cardSet || cardSet.source === "manual") return;
    
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const data = await response.json();
      alert(`Đã đồng bộ thành công! Cập nhật ${data.cardsCount || 0} thẻ.`);
      fetchCardSet(); // Refresh data
    } catch (error) {
      console.error("Sync error:", error);
      alert("Lỗi khi đồng bộ: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportToAnki = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:5001/api/cards/export/anki/${cardSetId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${cardSet.name}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportMenu(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi khi export: " + error.message);
    }
  };

  const startStudy = () => {
    navigate(`/cardset/${cardSetId}/study`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!cardSet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Không tìm thấy bộ thẻ</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{cardSet.name}</h1>
              {cardSet.description && (
                <p className="text-gray-600 mb-4">{cardSet.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{cardSet.stats.totalCards} thẻ</span>
                {cardSet.source !== "manual" && (
                  <span className={`px-2 py-1 rounded ${
                    cardSet.source === "quizlet" 
                      ? "bg-blue-100 text-blue-700" 
                      : cardSet.source === "anki"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {cardSet.source === "quizlet" ? "Từ Quizlet" : 
                     cardSet.source === "anki" ? "Từ Anki" : 
                     cardSet.source === "import" ? "Từ Import" : 
                     `Từ ${cardSet.source.charAt(0).toUpperCase() + cardSet.source.slice(1)}`}
                  </span>
                )}
                {cardSet.tags.length > 0 && (
                  <div className="flex gap-1">
                    {cardSet.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                onClick={() => setShowAddCardModal(true)}
              >
                Thêm thẻ
              </button>
              
              {cardSet.source !== "manual" && (
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isSyncing
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? "Đang đồng bộ..." : "Đồng bộ"}
                </button>
              )}
              
              <div className="relative">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg"
                      onClick={handleExportToAnki}
                    >
                      Export to Anki (.txt)
                    </button>
                  </div>
                )}
              </div>
              
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                onClick={startStudy}
              >
                Học
              </button>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Thẻ ({cardSet.stats.totalCards})</h2>
          </div>
          
          <div className="divide-y">
            {cards.map((card, index) => (
              <div key={card._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="text-sm text-gray-400 w-8">
                    {(currentPage - 1) * 50 + index + 1}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Mặt trước</div>
                      <div className="font-medium">
                        {card.content.front.text}
                      </div>
                      {card.content.front.image && (
                        <img 
                          src={card.content.front.image} 
                          alt="Front" 
                          className="mt-2 max-w-32 max-h-32 object-cover rounded"
                        />
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Mặt sau</div>
                      <div className="font-medium">
                        {card.content.back.text}
                      </div>
                      {card.content.back.image && (
                        <img 
                          src={card.content.back.image} 
                          alt="Back" 
                          className="mt-2 max-w-32 max-h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                  
                  {card.learning.status !== "new" && (
                    <div className="text-sm text-gray-500">
                      <div>Độ khó: {card.learning.easeFactor.toFixed(1)}</div>
                      <div>Khoảng cách: {card.learning.interval}d</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t flex justify-center">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                
                <span className="px-3 py-1">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Card Modal */}
      {showAddCardModal && (
        <AddCardModal 
          onClose={() => {
            setShowAddCardModal(false);
            fetchCardSet(); // Refresh the card list after adding cards
          }} 
          currentCardSet={cardSet?.name}
          cardSetId={cardSetId}
        />
      )}
    </div>
  );
}
