import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import AddCardModal from "../components/AddCardModal";
import TagMenu from "../components/TagMenu";
import AutoFlashcard from "../components/AutoFlashcard";

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
  
  // Menu states
  const [showTagMenu, setShowTagMenu] = useState(false);
  
  // Auto flashcard states
  const [showAutoFlashcard, setShowAutoFlashcard] = useState(false);
  const [highlightedCardIndex, setHighlightedCardIndex] = useState(-1);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ field: 'default', direction: 'asc' });
  // Star / favorite state
  const [starredIds, setStarredIds] = useState(new Set());
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  
  // Refs for scrolling
  const cardListRef = useRef(null);

  useEffect(() => {
    fetchCardSet();
    fetchAllCards(); // Fetch all cards for flashcard study
  }, [cardSetId]);

  // Cleanup on component unmount or page navigation
  useEffect(() => {
    return () => {
      console.log('CardSetPage unmounting - stopping speech');
      speechSynthesis.cancel();
    };
  }, []);

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

  // Fetch starred cards from backend (with one-time migration from localStorage if exists)
  useEffect(() => {
    const loadStars = async () => {
      if (!cardSetId) return;
      const token = localStorage.getItem('auth_token');
      try {
        const res = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/starred`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.cardIds)) {
            setStarredIds(new Set(data.cardIds.map(id => id.toString())));
          }
        } else if (res.status === 404) {
          setStarredIds(new Set());
        }
      } catch (e) {
        console.warn('Backend star fetch failed, using localStorage fallback', e);
        try {
          const raw = localStorage.getItem(`starred_cards_${cardSetId}`);
          if (raw) {
            setStarredIds(new Set(JSON.parse(raw)));
          }
        } catch {}
      }
    };
    loadStars();
  }, [cardSetId]);

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
    if (currentCard < studyCards.length - 1) {
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

  // Handle flashcard highlight and scroll
  const handleFlashcardHighlight = (index, shouldScroll = true) => {
    console.log('Flashcard highlight:', { index, shouldScroll });
    setHighlightedCardIndex(index);
    
    // Force show all cards when auto flashcard is active
    if (!showAllCards) {
      setShowAllCards(true);
    }
    
    // Only scroll if shouldScroll is true
    if (shouldScroll) {
      setTimeout(() => {
        if (cardListRef.current) {
          const cardElements = cardListRef.current.querySelectorAll('[data-card-index]');
          const targetCard = cardElements[index];
          if (targetCard) {
            console.log('Scrolling to card:', index);
            targetCard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }
      }, 100);
    } else {
      console.log('Highlighting card', index, 'but not scrolling');
    }
  };

  // Handle AutoFlashcard toggle with speech cleanup
  const handleAutoFlashcardToggle = () => {
    const newShowAutoFlashcard = !showAutoFlashcard;
    
    if (!newShowAutoFlashcard) {
      // When turning OFF AutoFlashcard, stop any ongoing speech
      console.log('Turning off AutoFlashcard - stopping speech');
      speechSynthesis.cancel();
      setHighlightedCardIndex(-1); // Clear highlight
    }
    
    setShowAutoFlashcard(newShowAutoFlashcard);
  };

  const startStudy = () => {
    navigate(`/cardset/${cardSetId}/study`);
  };

  // Menu handlers
  const handleEdit = () => { 
    setShowTagMenu(false);
    navigate(`/edit-cardset/${cardSetId}`);
  };
  const handleCopy = () => { setShowTagMenu(false); };
  const handlePrint = () => { setShowTagMenu(false); };
  const handlePin = () => { setShowTagMenu(false); };
  const handleExport = () => { setShowTagMenu(false); };
  const handleEmbed = () => { setShowTagMenu(false); };
  const handleDelete = () => { setShowTagMenu(false); };

  // Helper: extract plain text for sorting (basic strip HTML)
  const extractPlainText = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  const normalizeAlpha = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/^[^a-z0-9áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i, '')
  };

  // Multilingual first-key extraction (Latin, Kana, Kanji, Hangul, digits). Fallback '#'
  const getAlphabeticalKey = (raw) => {
    if (!raw) return '#';
    const text = raw.trim();
    if (!text) return '#';
    const ch = text[0];
    if (/^[A-Za-z]$/.test(ch)) return ch.toUpperCase();
    if (/^[0-9]$/.test(ch)) return ch;
    if (/^[\u3040-\u309F]$/.test(ch)) return ch; // Hiragana
    if (/^[\u30A0-\u30FF]$/.test(ch)) return ch; // Katakana
    if (/^[\u4E00-\u9FFF]$/.test(ch)) return ch; // CJK Unified Ideographs
    if (/^[\uAC00-\uD7AF]$/.test(ch)) return ch; // Hangul syllables
    return ch || '#';
  };

  // Global sort helper on raw card objects
  const sortCards = (arr) => {
    const { field, direction } = sortConfig;
    if (!arr || !arr.length) return arr;
    if (field === 'default' || !field) return arr;
    const dir = direction === 'desc' ? -1 : 1;
    return [...arr].sort((a, b) => {
      let va = '';
      let vb = '';
      switch (field) {
        case 'frontText':
          va = extractPlainText(a?.content?.front?.text || a?.content?.front?.html || '');
          vb = extractPlainText(b?.content?.front?.text || b?.content?.front?.html || '');
          break;
        case 'alphabetical': {
          const ta = extractPlainText(a?.content?.front?.text || a?.content?.front?.html || '');
            const tb = extractPlainText(b?.content?.front?.text || b?.content?.front?.html || '');
            const ka = getAlphabeticalKey(ta);
            const kb = getAlphabeticalKey(tb);
            if (ka === kb) {
              return ta.localeCompare(tb, ['vi','ja','en'], { sensitivity: 'base' }) * dir;
            }
            return ka.localeCompare(kb, ['vi','ja','en'], { sensitivity: 'base' }) * dir;
        }
          break;
        case 'backText':
          va = extractPlainText(a?.content?.back?.text || a?.content?.back?.html || '');
          vb = extractPlainText(b?.content?.back?.text || b?.content?.back?.html || '');
          break;
        case 'createdAt':
          va = a?.metadata?.createdAt || a?.createdAt || '';
          vb = b?.metadata?.createdAt || b?.createdAt || '';
          break;
        case 'updatedAt':
          va = a?.metadata?.updatedAt || a?.updatedAt || '';
          vb = b?.metadata?.updatedAt || b?.updatedAt || '';
          break;
        case 'difficulty':
          va = a?.learning?.easeFactor ?? 0;
          vb = b?.learning?.easeFactor ?? 0;
          break;
        default:
          return 0;
      }
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      const da = Date.parse(va); const db = Date.parse(vb);
      if (!isNaN(da) && !isNaN(db)) return (da - db) * dir;
      return va.toString().localeCompare(vb.toString(), 'vi', { sensitivity: 'base' }) * dir;
    });
  };

  // Full sorted list + star filter
  const fullSortedCards = useMemo(() => {
    let list = sortCards(allCards);
    if (showStarredOnly) list = list.filter(c => starredIds.has(c._id));
    return list.map((c, idx) => ({ ...c, _sortedIndex: idx }));
  }, [allCards, sortConfig, showStarredOnly, starredIds]);

  // Build displayedCards honoring pagination when collapsed
  let displayedCards = [];
  if (showAllCards) {
    displayedCards = fullSortedCards.map(c => ({ card: c, sortedIndex: c._sortedIndex }));
  } else {
    const pageSize = 50;
    const start = (currentPage - 1) * pageSize;
    const slice = fullSortedCards.slice(start, start + pageSize);
    displayedCards = slice.map(c => ({ card: c, sortedIndex: c._sortedIndex }));
  }

  const studyCards = fullSortedCards; // same ordering for study modes
  const isStarred = (id) => !!id && starredIds.has(id);
  const toggleStar = async (id) => {
    if (!id) return;
    const token = localStorage.getItem('auth_token');
    // Optimistic update
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      const res = await fetch(`http://localhost:5001/api/cards/cards/${id}/star`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to toggle on server');
      }
      const data = await res.json();
      // Ensure local state matches server response (in case of race)
      setStarredIds(prev => {
        const next = new Set(prev);
        if (data.starred) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    } catch (e) {
      console.warn('Server star toggle failed, reverting', e);
      // Revert
      setStarredIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    }
  };
  if (showStarredOnly) {
    displayedCards = displayedCards.filter(obj => isStarred(obj.card._id));
  }

  // Build study cards (always based on allCards, full set) respecting sorting & star filter
  // studyCards now derived from fullSortedCards (see above)

  // Reset flashcard index if filtering/sorting changes and index out of range
  useEffect(() => {
    if (currentCard >= studyCards.length) {
      setCurrentCard(0);
      setShowAnswer(false);
    }
  }, [studyCards.length]);

  const handleChangeSortField = (e) => {
    setSortConfig(cfg => ({ ...cfg, field: e.target.value }));
  };
  const toggleSortDirection = () => {
    setSortConfig(cfg => ({ ...cfg, direction: cfg.direction === 'asc' ? 'desc' : 'asc' }));
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
              
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"
                onClick={() => {/* Handle share */}}
              >
                <span className="material-icons text-sm">share</span>
                Chia sẻ
              </button>
              
              <div className="relative">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 text-xl font-bold hover:bg-gray-200 transition"
                  onClick={() => setShowTagMenu(v => !v)}
                >
                  <span className="material-icons" style={{fontSize: '1.5rem', color: 'gray'}}>more_horiz</span>
                </button>
                <TagMenu
                  show={showTagMenu}
                  onClose={() => setShowTagMenu(false)}
                  onEdit={handleEdit}
                  onCopy={handleCopy}
                  onPrint={handlePrint}
                  onPin={handlePin}
                  onExport={handleExport}
                  onEmbed={handleEmbed}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard Study Section */}
  {studyCards.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Học với thẻ ghi nhớ</h2>
            
            {/* Study modes */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => {
                  // When switching to regular flashcard, stop speech and turn off AutoFlashcard
                  if (showAutoFlashcard) {
                    console.log('Switching to regular flashcard - stopping speech');
                    speechSynthesis.cancel();
                    setShowAutoFlashcard(false);
                    setHighlightedCardIndex(-1);
                  }
                }}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
              >
                <span className="material-icons text-sm">credit_card</span>
                Thẻ ghi nhớ
              </button>
              <button 
                onClick={handleAutoFlashcardToggle}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm ${
                  showAutoFlashcard 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="material-icons text-sm">play_circle</span>
                Auto Flashcard
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

            {/* Conditional display: AutoFlashcard or regular flashcard */}
            {showAutoFlashcard ? (
              <div className="mb-6">
                <AutoFlashcard 
                  cards={studyCards} 
                  onHighlight={handleFlashcardHighlight}
                />
              </div>
            ) : (
              <>
                {/* Card display */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div 
                      className="w-96 h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border cursor-pointer transition-all hover:scale-105 hover:shadow-xl overflow-hidden flex flex-col"
                      onClick={toggleAnswer}
                    >
                      {/* Header */}
                      <div className="px-4 py-2 flex-shrink-0 border-b border-gray-200/50 bg-white/70">
                        <div className="text-xs text-gray-500 text-center">
                          {showAnswer ? "Mặt sau" : "Mặt trước"} - Click để lật thẻ
                        </div>
                      </div>
                      
                      {/* Content with scroll */}
                      <div className="flex-1 p-4 overflow-y-auto flashcard-content">
                        <div className="h-full flex items-center justify-center">
                          <div 
                            className="text-lg font-medium break-words leading-relaxed text-center flashcard-text w-full"
                            style={{ 
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto'
                            }}
                            dangerouslySetInnerHTML={{
                              __html: showAnswer 
                                ? studyCards[currentCard]?.content.back.text || ''
                                : studyCards[currentCard]?.content.front.text || ''
                            }}
                          />
                        </div>
                      </div>
                    </div>
                {/* Audio button (placeholder) */}
                <button
                  className="absolute bottom-3 right-12 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                  onClick={(e)=>{e.stopPropagation(); /* TODO: play audio */}}
                  title="Nghe"
                >
                  <span className="material-icons text-gray-600 text-sm">volume_up</span>
                </button>
                {/* Star button */}
                <button
                  className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                  onClick={(e)=>{e.stopPropagation(); const id = studyCards[currentCard]?._id; toggleStar(id);}}
                  title={isStarred(studyCards[currentCard]?._id) ? 'Bỏ sao' : 'Đánh dấu sao'}
                >
                  <span className={`material-icons text-sm ${isStarred(studyCards[currentCard]?._id) ? 'text-yellow-500' : 'text-gray-400'}`}>{isStarred(studyCards[currentCard]?._id) ? 'star' : 'star_border'}</span>
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
                <div className="text-lg font-semibold">{currentCard + 1} / {studyCards.length}</div>
                <div className="text-xs text-gray-500">Thẻ hiện tại</div>
              </div>

              <button 
                className="w-10 h-10 bg-white rounded-full shadow border flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                onClick={nextCard}
                disabled={currentCard === studyCards.length - 1}
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
              </>
            )}
          </div>
        )}

        {/* Cards List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Danh sách từ vựng ({cardSet.stats.totalCards})</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Sort controls */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <label className="text-xs text-gray-500">Sắp xếp:</label>
                <select
                  value={sortConfig.field}
                  onChange={handleChangeSortField}
                  className="text-sm border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="default">Mặc định</option>
                  <option value="frontText">Từ (mặt trước)</option>
                  <option value="alphabetical">Bảng chữ cái (mặt trước)</option>
                  <option value="backText">Nghĩa (mặt sau)</option>
                  <option value="difficulty">Độ khó (ease)</option>
                  <option value="createdAt">Ngày tạo</option>
                  <option value="updatedAt">Ngày cập nhật</option>
                </select>
                <button
                  onClick={toggleSortDirection}
                  className="w-8 h-8 flex items-center justify-center rounded border bg-white hover:bg-gray-100"
                  title={sortConfig.direction === 'asc' ? 'Đang tăng dần' : 'Đang giảm dần'}
                >
                  <span className="material-icons text-sm text-gray-600">
                    {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </button>
              </div>
              <button
                onClick={() => setShowStarredOnly(s => !s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${showStarredOnly ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Hiển thị chỉ các thẻ đã sao"
              >
                <span className="material-icons text-sm">star</span>
                {showStarredOnly ? 'Đang lọc sao' : 'Lọc sao'}
                {starredIds.size > 0 && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">{starredIds.size}</span>
                )}
              </button>

              {/* Toggle show all */}
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
          </div>
          
          {/* Alphabetical grouping if selected */}
          <div ref={cardListRef} className="max-h-96 overflow-y-auto">
            {sortConfig.field === 'alphabetical' ? (
              (() => {
                const groups = {};
                displayedCards.forEach((it) => {
                  const rawFront = extractPlainText(it.card?.content?.front?.text || it.card?.content?.front?.html || '');
                  let key = getAlphabeticalKey(rawFront);
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(it);
                });
                const orderedKeys = Object.keys(groups).sort((a,b) => a.localeCompare(b, ['vi','ja','en']));
                return orderedKeys.map(letter => (
                  <div key={letter} className="border-b last:border-b-0">
                    <div className="sticky top-0 z-10 bg-gray-100/90 backdrop-blur px-3 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">{letter}</div>
                    <div className="divide-y">
                      {groups[letter].map((item, localIdx) => {
                        const { card, originalIndex } = item;
                        const isHighlighted = highlightedCardIndex === originalIndex;
                        return (
                          <div
                            key={card._id}
                            data-card-index={originalIndex}
                            className={`p-4 hover:bg-gray-50 transition-colors ${isHighlighted ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-sm text-gray-400 w-12 flex-shrink-0 flex items-start gap-1">
                                <span className="pt-0.5">{letter}</span>
                                <button
                                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-yellow-50"
                                  onClick={() => toggleStar(card._id)}
                                  title={isStarred(card._id) ? 'Bỏ sao' : 'Đánh dấu sao'}
                                >
                                  <span className={`material-icons text-base ${isStarred(card._id) ? 'text-yellow-500' : 'text-gray-300'}`}>{isStarred(card._id) ? 'star' : 'star_border'}</span>
                                </button>
                              </div>
                              <div className="flex-1">
                                <div className="mb-3">
                                  <div className="text-sm text-gray-500 mb-1">Từ</div>
                                  <div className="font-medium text-base card-content">
                                    {card.content.front.text && (
                                      <div className="mb-2"><div dangerouslySetInnerHTML={{ __html: card.content.front.text }} /></div>
                                    )}
                                    {card.content.front.html && card.content.front.html !== card.content.front.text && (
                                      <>
                                        {card.content.front.text && <hr className="border-gray-300 my-2" />}
                                        <div className="mb-2"><div dangerouslySetInnerHTML={{ __html: card.content.front.html }} /></div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <hr className="border-gray-400 mb-3" />
                                <div>
                                  <div className="text-sm text-gray-500 mb-1">Nghĩa</div>
                                  <div className="text-gray-700 card-content">
                                    {card.content.back.text && (
                                      <div className="mb-2"><div dangerouslySetInnerHTML={{ __html: card.content.back.text }} /></div>
                                    )}
                                    {card.content.back.html && card.content.back.html !== card.content.back.text && (
                                      <>
                                        {card.content.back.text && <hr className="border-gray-300 my-2" />}
                                        <div className="mb-2"><div dangerouslySetInnerHTML={{ __html: card.content.back.html }} /></div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {card.learning.status !== 'new' && (
                                <div className="text-xs text-gray-500 flex-shrink-0">
                                  <div>Độ khó: {card.learning.easeFactor.toFixed(1)}</div>
                                  <div>Khoảng cách: {card.learning.interval}d</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ));
              })()
            ) : (
              displayedCards.map((item, index) => {
              const { card, originalIndex } = item;
              const isHighlighted = highlightedCardIndex === originalIndex;
              return (
                <div 
                  key={card._id}
                  data-card-index={originalIndex}
                  className={`p-4 hover:bg-gray-50 transition-colors ${isHighlighted ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-sm text-gray-400 w-12 flex-shrink-0 flex items-start gap-1">
                      <span className="pt-0.5">{showAllCards ? (index + 1) : (Math.floor(originalIndex) + 1)}</span>
                      <button
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-yellow-50"
                        onClick={() => toggleStar(card._id)}
                        title={isStarred(card._id) ? 'Bỏ sao' : 'Đánh dấu sao'}
                      >
                        <span className={`material-icons text-base ${isStarred(card._id) ? 'text-yellow-500' : 'text-gray-300'}`}>{isStarred(card._id) ? 'star' : 'star_border'}</span>
                      </button>
                    </div>
                    <div className="flex-1">
                      {/* Front (Term) */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">Từ</div>
                        <div className="font-medium text-base card-content">
                          {card.content.front.text && (
                            <div className="mb-2">
                              <div dangerouslySetInnerHTML={{ __html: card.content.front.text }} />
                            </div>
                          )}
                          {card.content.front.html && card.content.front.html !== card.content.front.text && (
                            <>
                              {card.content.front.text && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <div dangerouslySetInnerHTML={{ __html: card.content.front.html }} />
                              </div>
                            </>
                          )}
                          {card.content.front.image && (
                            <>
                              {(card.content.front.text || card.content.front.html) && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <img src={card.content.front.image} alt="Front content" className="max-w-full h-auto rounded" />
                              </div>
                            </>
                          )}
                          {card.content.front.audio && (
                            <>
                              {(card.content.front.text || card.content.front.html || card.content.front.image) && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <audio controls className="w-full">
                                  <source src={card.content.front.audio} />
                                  Trình duyệt không hỗ trợ audio.
                                </audio>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <hr className="border-gray-400 mb-3" />
                      {/* Back (Definition) */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Nghĩa</div>
                        <div className="text-gray-700 card-content">
                          {card.content.back.text && (
                            <div className="mb-2">
                              <div dangerouslySetInnerHTML={{ __html: card.content.back.text }} />
                            </div>
                          )}
                          {card.content.back.html && card.content.back.html !== card.content.back.text && (
                            <>
                              {card.content.back.text && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <div dangerouslySetInnerHTML={{ __html: card.content.back.html }} />
                              </div>
                            </>
                          )}
                          {card.content.back.image && (
                            <>
                              {(card.content.back.text || card.content.back.html) && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <img src={card.content.back.image} alt="Back content" className="max-w-full h-auto rounded" />
                              </div>
                            </>
                          )}
                          {card.content.back.audio && (
                            <>
                              {(card.content.back.text || card.content.back.html || card.content.back.image) && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <audio controls className="w-full">
                                  <source src={card.content.back.audio} />
                                  Trình duyệt không hỗ trợ audio.
                                </audio>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {card.learning.status !== "new" && (
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        <div>Độ khó: {card.learning.easeFactor.toFixed(1)}</div>
                        <div>Khoảng cách: {card.learning.interval}d</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}
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
