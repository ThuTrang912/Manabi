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
  const [showAllCards, setShowAllCards] = useState(false); // For expand/collapse card list
  
  // Flashcard study states
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [allCards, setAllCards] = useState([]); // All cards for flashcard study

  useEffect(() => {
    fetchCardSet();
    fetchAllCards(); // Fetch all cards for flashcard study
  }, [cardSetId]);

  // Separate useEffect for pagination to avoid infinite loop
  useEffect(() => {
    if (!showAllCards) {
      fetchCardSet(); // Only fetch paginated cards when not showing all
    }
  }, [currentPage, showAllCards]);

  // Re-fetch when showAllCards changes
  useEffect(() => {
    if (cardSetId) {
      fetchCardSet();
    }
  }, [showAllCards]);

  const fetchAllCards = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards?page=1&limit=1000`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllCards(data.cards || []);
      }
    } catch (error) {
      console.error("Error fetching all cards:", error);
    }
  };

  const fetchCardSet = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // If showing all cards, fetch all cards in one request
      if (showAllCards) {
        const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards?page=1&limit=10000`, {
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
        setTotalPages(1); // When showing all, we only have 1 page
        setLoading(false);
      } else {
        // Normal paginated fetch (50 cards per page)
        const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards?page=${currentPage}&limit=50`, {
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
      }
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

  // Flashcard navigation functions
  const nextCard = () => {
    if (currentCard < allCards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleShowAllCards = () => {
    setShowAllCards(!showAllCards);
    if (showAllCards) {
      // When collapsing, reset to page 1
      setCurrentPage(1);
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

        {/* Flashcard Study Section */}
        {allCards.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Học với thẻ ghi nhớ</h2>
            
            {/* Study modes */}
            <div className="flex gap-4 mb-6">
              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
                <span className="material-icons text-sm">credit_card</span>
                Thẻ ghi nhớ
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
                <span className="material-icons text-sm">refresh</span>
                Học
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
                <span className="material-icons text-sm">speed</span>
                Blast
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
                <span className="material-icons text-sm">quiz</span>
                Kiểm tra
              </button>
            </div>

            {/* Card display */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div 
                  className="w-80 h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border cursor-pointer flex items-center justify-center text-center p-6 transition-all hover:scale-105 hover:shadow-xl"
                  onClick={toggleAnswer}
                >
                  <div className="w-full">
                    <div className="text-xl font-bold mb-3 card-content">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: showAnswer 
                            ? allCards[currentCard]?.content.back.text || ''
                            : allCards[currentCard]?.content.front.text || ''
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {showAnswer ? "Mặt sau" : "Mặt trước"} - Click để lật thẻ
                    </div>
                  </div>
                </div>
                {/* Audio button */}
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="material-icons text-gray-600 text-sm">volume_up</span>
                </button>
                {/* Star button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="material-icons text-gray-400 text-sm">star_border</span>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button 
                className="w-10 h-10 bg-white rounded-full shadow border flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                onClick={prevCard}
                disabled={currentCard === 0}
              >
                <span className="material-icons text-sm">arrow_back</span>
              </button>
              
              <div className="text-center">
                <div className="text-lg font-semibold">{currentCard + 1} / {allCards.length}</div>
                <div className="text-xs text-gray-500">Thẻ hiện tại</div>
              </div>

              <button 
                className="w-10 h-10 bg-white rounded-full shadow border flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                onClick={nextCard}
                disabled={currentCard === allCards.length - 1}
              >
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Settings */}
            <div className="flex justify-center">
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-xs">Theo dõi tiến độ</span>
                </label>
                <button className="text-gray-600">
                  <span className="material-icons text-sm">settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Danh sách từ vựng ({cardSet.stats.totalCards})</h2>
            
            {/* Toggle button for show all / paginated view */}
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAllCards
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              onClick={toggleShowAllCards}
            >
              {showAllCards ? "Thu gọn" : "Xem tất cả"}
            </button>
          </div>
          
          <div className="divide-y max-h-96 overflow-y-auto">
            {cards.map((card, index) => (
              <div key={card._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="text-sm text-gray-400 w-8 flex-shrink-0">
                    {showAllCards ? index + 1 : (currentPage - 1) * 50 + index + 1}
                  </div>
                  
                  {/* Vertical layout for term and definition */}
                  <div className="flex-1">
                    {/* Front (Term) */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-500 mb-1">Từ</div>
                      <div className="font-medium text-base card-content">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: card.content.front.text || ''
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Divider line */}
                    <hr className="border-gray-200 mb-3" />
                    
                    {/* Back (Definition) */}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Nghĩa</div>
                      <div className="text-gray-700 card-content">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: card.content.back.text || ''
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning progress */}
                  {card.learning.status !== "new" && (
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      <div>Độ khó: {card.learning.easeFactor.toFixed(1)}</div>
                      <div>Khoảng cách: {card.learning.interval}d</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination - only show when not showing all cards */}
          {!showAllCards && totalPages > 1 && (
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

          {/* Show total count when showing all */}
          {showAllCards && (
            <div className="p-4 border-t text-center text-sm text-gray-500">
              Hiển thị tất cả {cards.length} thẻ
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
