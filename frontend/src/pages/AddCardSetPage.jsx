import TopBar from "../components/TopBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AddCardModal from "../components/AddCardModal";

export default function AddCardSetPage() {
  const navigate = useNavigate();
  const { cardSetId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!cardSetId || searchParams.get('edit') === 'true';
  
  const [cardSetName, setCardSetName] = useState("");
  const [desc, setDesc] = useState("");
  const [rows, setRows] = useState([
    { term: "", definition: "", image: "" },
    { term: "", definition: "", image: "" },
  ]);
  
  // Modal states
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState(""); // "quizlet" or "anki"
  const [createdCardSetId, setCreatedCardSetId] = useState(cardSetId || null); // Store created card set ID
  const [editingCard, setEditingCard] = useState(null); // Store card being edited
  
  // Import states
  const [quizletUrl, setQuizletUrl] = useState("");
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [ankiFile, setAnkiFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [frontFields, setFrontFields] = useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = useState([{ id: 2, label: "Mặt sau", value: "" }]);

  // Load existing card set data when in edit mode
  useEffect(() => {
    const loadCardSetData = async () => {
      if (isEditMode && (cardSetId || searchParams.get('cardSetId'))) {
        setLoading(true);
        try {
          const token = localStorage.getItem("auth_token");
          const targetCardSetId = cardSetId || searchParams.get('cardSetId');
          
          // Fetch card set details
          const cardSetResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (cardSetResponse.ok) {
            const cardSetData = await cardSetResponse.json();
            setCardSetName(cardSetData.name);
            setDesc(cardSetData.description || "");
            setCreatedCardSetId(targetCardSetId);
          } else {
            console.error("Failed to load card set:", cardSetResponse.status);
          }

          // Fetch cards in the set
          const cardsResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards?page=1&limit=1000`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (cardsResponse.ok) {
            const cardsData = await cardsResponse.json();
            const cardRows = cardsData.cards.map(card => ({
              id: card._id,
              term: card.content.front.text || "",
              definition: card.content.back.text || "",
              image: card.content.front.image || ""
            }));
            
            // Ensure at least 2 rows
            if (cardRows.length === 0) {
              setRows([
                { term: "", definition: "", image: "" },
                { term: "", definition: "", image: "" },
              ]);
            } else {
              setRows(cardRows);
            }
          } else {
            console.error("Failed to load cards:", cardsResponse.status);
          }
        } catch (error) {
          console.error("Error loading card set data:", error);
          alert("Lỗi khi tải dữ liệu bộ thẻ: " + error.message);
        } finally {
          setLoading(false);
        }
      } else if (searchParams.get('edit') === 'true') {
        // Handle edit from URL params (from FolderPage)
        const name = searchParams.get('name');
        const terms = searchParams.get('terms');
        
        if (name) {
          setCardSetName(decodeURIComponent(name));
          setDesc(`Bộ thẻ có ${terms} từ vựng`);
          
          // Create sample rows based on terms count
          const termCount = parseInt(terms) || 2;
          const sampleRows = Array.from({length: Math.max(2, Math.min(termCount, 10))}, (_, i) => ({
            term: `Từ ${i + 1}`,
            definition: `Định nghĩa ${i + 1}`,
            image: ""
          }));
          setRows(sampleRows);
        }
      }
    };

    loadCardSetData();
  }, [cardSetId, isEditMode, searchParams]);

  // Warning when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        const confirmLeave = confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?');
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Function to create card set first, then open modal
  const handleAddCardToSet = async () => {
    if (!cardSetName.trim()) {
      alert("Vui lòng nhập tên bộ thẻ trước");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        alert("Vui lòng đăng nhập trước khi tạo bộ thẻ");
        return;
      }

      // Check if card set already exists or create new one
      let cardSetId = createdCardSetId;
      
      if (!cardSetId) {
        // Create the card set first
        const response = await fetch("http://localhost:5001/api/cards/sets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cardSetName,
            description: desc.trim() || "",
            source: "manual"
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409 && errorData.cardSet) {
            // Card set already exists, use the existing one
            cardSetId = errorData.cardSet._id;
            setCreatedCardSetId(cardSetId);
          } else {
            throw new Error(errorData.message || "Failed to create card set");
          }
        } else {
          const data = await response.json();
          cardSetId = data.cardSet._id;
          setCreatedCardSetId(cardSetId);
        }
      }

      // Now open the modal with the card set ID
      setShowAddCardModal(true);
      
    } catch (error) {
      console.error("Error creating card set:", error);
      alert("Lỗi khi tạo bộ thẻ: " + error.message);
    }
  };

  // Import functions
  const handleImportFromQuizlet = async () => {
    // Check if we have any input
    if (!quizletUrl.trim() && !csvText.trim() && !jsonText.trim()) {
      alert("Vui lòng nhập URL Quizlet hoặc dữ liệu CSV/JSON");
      return;
    }
    
    // Warning if no custom name provided
    if (!cardSetName.trim()) {
      const proceed = confirm("Bạn chưa nhập tên bộ thẻ. Tên sẽ được tự động tạo từ dữ liệu import. Tiếp tục?");
      if (!proceed) return;
    }
    
    setIsImporting(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      // Prepare request body based on what data we have
      const requestBody = {};
      if (quizletUrl.trim()) requestBody.url = quizletUrl;
      if (csvText.trim()) requestBody.csvText = csvText;
      if (jsonText.trim()) requestBody.jsonText = jsonText;
      
      // Add custom name if user entered one - with explicit fallback
      const finalCustomName = cardSetName && cardSetName.trim() ? cardSetName.trim() : null;
      if (finalCustomName) {
        requestBody.customName = finalCustomName;
      }
      
      const response = await fetch("http://localhost:5001/api/cards/import/quizlet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      // Alert if name doesn't match expectation
      if (finalCustomName && data.cardSet?.name !== finalCustomName) {
        console.error("❌ NAME MISMATCH!", {
          expected: finalCustomName,
          received: data.cardSet?.name
        });
      }
      
      if (!response.ok) {
        // Handle special case for blocked Quizlet access
        if (response.status === 400 && data.alternative) {
          alert(`${data.message}\n\n${data.alternative}`);
          return;
        }
        throw new Error(data.message || "Import failed");
      }
      
      alert(`Đã import thành công ${data.cardsImported} thẻ!`);
      setShowImportModal(false);
      setQuizletUrl("");
      setCsvText("");
      setJsonText("");
      navigate(`/cardset/${data.cardSet._id}`);
      
    } catch (error) {
      console.error("Import error:", error);
      alert("Lỗi khi import: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromAnki = async () => {
    if (!ankiFile) {
      alert("Vui lòng chọn file Anki");
      return;
    }
    
    // Warning if no custom name provided
    if (!cardSetName.trim()) {
      const proceed = confirm("Bạn chưa nhập tên bộ thẻ. Tên sẽ được tự động tạo. Tiếp tục?");
      if (!proceed) return;
    }
    
    setIsImporting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", ankiFile);
      
      // Use custom name if user entered one, otherwise use default
      const deckName = cardSetName.trim() || "Imported from Anki";
      formData.append("deckName", deckName);
      
      const response = await fetch("http://localhost:5001/api/cards/import/anki", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Import failed");
      }
      
      const data = await response.json();
      
      alert(`Đã import thành công ${data.cardsCount || data.totalCards} thẻ từ Anki!`);
      setShowImportModal(false);
      setAnkiFile(null);
      
      if (data.cardSet) {
        navigate(`/cardset/${data.cardSet._id}`);
      } else if (data.results && data.results.length > 0) {
        navigate(`/cardset/${data.results[0].cardSet._id}`);
      }
      
    } catch (error) {
      console.error("Import error:", error);
      alert("Lỗi khi import từ Anki: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRowChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
    setHasUnsavedChanges(true);
  };

  // const addRow = () => {
  //   setRows([...rows, { term: "", definition: "", image: "" }]);
  // };
  // Thêm trường động cho modal
  const addFrontField = () => {
    const nextId = frontFields.length ? Math.max(...frontFields.map(f => f.id)) + 1 : 1;
    setFrontFields([...frontFields, { id: nextId, label: `Trường mặt trước ${nextId}`, value: "" }]);
  };
  const addBackField = () => {
    const nextId = backFields.length ? Math.max(...backFields.map(f => f.id)) + 1 : 1;
    setBackFields([...backFields, { id: nextId, label: `Trường mặt sau ${nextId}`, value: "" }]);
  };
  const removeFrontField = (id) => {
    setFrontFields(frontFields.filter(f => f.id !== id));
  };
  const removeBackField = (id) => {
    setBackFields(backFields.filter(f => f.id !== id));
  };
  const updateFrontField = (id, value) => {
    setFrontFields(frontFields.map(f => f.id === id ? { ...f, value } : f));
  };
  const updateBackField = (id, value) => {
    setBackFields(backFields.map(f => f.id === id ? { ...f, value } : f));
  };
  // Thêm card vào danh sách
  const handleAddCard = () => {
    setRows([
      ...rows,
      {
        term: frontFields.map(f => f.value).join(" | "),
        definition: backFields.map(f => f.value).join(" | "),
        image: ""
      }
    ]);
    setShowAddCardModal(false);
    setFrontFields([{ id: 1, label: "Mặt trước", value: "" }]);
    setBackFields([{ id: 2, label: "Mặt sau", value: "" }]);
  };

  // Handle save for edit mode
  const handleSave = async () => {
    if (!cardSetName.trim()) {
      alert("Vui lòng nhập tên bộ thẻ");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const targetCardSetId = cardSetId || searchParams.get('cardSetId');

      // Update card set info
      const updateResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cardSetName,
          description: desc.trim() || "",
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update card set");
      }

      // Get existing cards to update/delete
      const existingCardsResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards?page=1&limit=1000`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      let existingCards = [];
      if (existingCardsResponse.ok) {
        const existingCardsData = await existingCardsResponse.json();
        existingCards = existingCardsData.cards;
      }

      // REAL CARD UPDATES: Update existing cards and create only new ones
      // Now we have proper backend endpoints for individual card updates and deletes
      
      console.log("Processing", rows.length, "cards from interface");
      
      // Step 1: Update/create cards based on whether they have IDs
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.term.trim() && !row.definition.trim()) continue;

        const cardData = {
          frontFields: [{ value: row.term.trim() || '' }],
          backFields: [{ value: row.definition.trim() || '' }]
        };

        if (row.id && existingCards.find(card => card._id === row.id)) {
          // Update existing card using PUT endpoint
          console.log("Updating existing card:", row.id);
          
          const response = await fetch(`http://localhost:5001/api/cards/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Update card failed:", response.status, errorText);
            throw new Error(`Lỗi cập nhật thẻ ${i + 1}: ${response.status} - ${errorText}`);
          }
          
          console.log("Successfully updated card:", row.id);
        } else {
          // Create new card
          console.log("Creating new card for position:", i);
          
          const response = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Create card failed:", response.status, errorText);
            throw new Error(`Lỗi tạo thẻ ${i + 1}: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log("Successfully created card:", result.card._id);
        }
      }

      // Step 2: Delete cards that are no longer in rows  
      const rowIds = rows.map(row => row.id).filter(Boolean);
      const cardsToDelete = existingCards.filter(card => !rowIds.includes(card._id));
      
      if (cardsToDelete.length > 0) {
        console.log("Deleting", cardsToDelete.length, "cards no longer in interface");
        
        for (const card of cardsToDelete) {
          const response = await fetch(`http://localhost:5001/api/cards/${card._id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Delete card failed:", response.status, errorText);
            // Don't throw error for delete failures - just log
            console.warn(`Failed to delete card ${card._id}: ${errorText}`);
          } else {
            console.log("Successfully deleted card:", card._id);
          }
        }
      }

      setHasUnsavedChanges(false);
      navigate(`/cardset/${targetCardSetId}`);
      
    } catch (error) {
      console.error("Error saving card set:", error);
      alert("Lỗi khi lưu bộ thẻ: " + error.message);
    }
  };

  const handleSaveAndStudy = async () => {
    if (!cardSetName.trim()) {
      alert("Vui lòng nhập tên bộ thẻ");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const targetCardSetId = cardSetId || searchParams.get('cardSetId');

      // Update card set info first
      const updateResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cardSetName,
          description: desc.trim() || "",
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update card set");
      }

      // Get existing cards to update/delete
      const existingCardsResponse = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards?page=1&limit=1000`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      let existingCards = [];
      if (existingCardsResponse.ok) {
        const existingCardsData = await existingCardsResponse.json();
        existingCards = existingCardsData.cards;
      }

      // REAL CARD UPDATES: Update existing cards and create only new ones
      console.log("Processing", rows.length, "cards from interface");
      
      // Update/create cards based on whether they have IDs
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.term.trim() && !row.definition.trim()) continue;

        const cardData = {
          frontFields: [{ value: row.term.trim() || '' }],
          backFields: [{ value: row.definition.trim() || '' }]
        };

        if (row.id && existingCards.find(card => card._id === row.id)) {
          // Update existing card
          const response = await fetch(`http://localhost:5001/api/cards/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Update card failed:", response.status, errorText);
            throw new Error(`Lỗi cập nhật thẻ: ${errorText}`);
          }
        } else {
          // Create new card
          const response = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Create card failed:", response.status, errorText);
            throw new Error(`Lỗi tạo thẻ: ${errorText}`);
          }
        }
      }

      // Delete cards no longer in interface
      const rowIds = rows.map(row => row.id).filter(Boolean);
      const cardsToDelete = existingCards.filter(card => !rowIds.includes(card._id));
      
      for (const card of cardsToDelete) {
        await fetch(`http://localhost:5001/api/cards/${card._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      }

      // Navigate to study mode after successful save
      setHasUnsavedChanges(false);
      navigate(`/cardset/${targetCardSetId}`);
      
    } catch (error) {
      console.error("Error saving card set:", error);
      alert("Lỗi khi lưu bộ thẻ: " + error.message);
    }
  };

  // Handle create new card set 
  const handleCreateCardSet = async () => {
    if (!cardSetName.trim()) {
      alert("Vui lòng nhập tên bộ thẻ");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        alert("Vui lòng đăng nhập trước khi tạo bộ thẻ");
        return;
      }

      // Create the card set first
      const response = await fetch("http://localhost:5001/api/cards/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cardSetName,
          description: desc.trim() || "",
          source: "manual"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.cardSet) {
          // Card set already exists, use the existing one
          const cardSetId = errorData.cardSet._id;
          setCreatedCardSetId(cardSetId);
          alert("Bộ thẻ đã tồn tại, sẽ sử dụng bộ thẻ có sẵn");
        } else {
          throw new Error(errorData.message || "Failed to create card set");
        }
      } else {
        const data = await response.json();
        const cardSetId = data.cardSet._id;
        setCreatedCardSetId(cardSetId);

        // Create cards if any rows have content
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row.term.trim() && !row.definition.trim()) continue;

          const cardData = {
            frontFields: [{ value: row.term }],
            backFields: [{ value: row.definition }]
          };

          await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
          });
        }

        navigate(`/cardset/${cardSetId}`);
      }
      
    } catch (error) {
      console.error("Error creating card set:", error);
      alert("Lỗi khi tạo bộ thẻ: " + error.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar navigate={navigate} />
      {loading ? (
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow p-8">
          <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-2">
            {isEditMode ? "Sửa Bộ thẻ" : "Tạo một Bộ thẻ mới"}
          </h2>
          <div className="mb-4 text-gray-500 text-sm">
            Đã lưu chưa đầy 1 phút trước
          </div>
          
        <input
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Tên bộ thẻ..."
          value={cardSetName}
          onChange={e => setCardSetName(e.target.value)}
        />
        <textarea
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Thêm mô tả..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="flex gap-2 mb-6">
          <button 
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 hover:bg-blue-200 transition"
            onClick={() => {
              setImportType("quizlet");
              setShowImportModal(true);
            }}
          >
            <span className="material-icons">input</span> Import từ Quizlet
          </button>
          <button 
            className="px-4 py-2 rounded bg-green-100 text-green-700 font-semibold flex items-center gap-2 hover:bg-green-200 transition"
            onClick={() => {
              setImportType("anki");
              setShowImportModal(true);
            }}
          >
            <span className="material-icons">file_upload</span> Import từ Anki
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 transition">
            <span className="material-icons">schema</span> Thêm sơ đồ
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 transition">
            <span className="material-icons">note_add</span> Tạo từ ghi chú
          </button>
        </div>
        
        {/* Hiển thị các thẻ hiện có */}
        {rows.length > 0 && (isEditMode || rows.some(row => row.term || row.definition)) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {isEditMode ? "Các thẻ hiện có" : "Danh sách thẻ"}
            </h3>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {rows.map((row, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="text-sm text-gray-400 w-8 flex-shrink-0">
                      {idx + 1}
                    </div>
                    
                    {/* Card content display like CardSetPage */}
                    <div className="flex-1">
                      {/* Front (Term) */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">Từ</div>
                        <div className="font-medium text-base">
                          {row.term ? (
                            <div className="mb-2">
                              <div dangerouslySetInnerHTML={{ __html: row.term }} />
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">Chưa có nội dung</div>
                          )}
                          
                          {/* Image content for front */}
                          {row.image && (
                            <>
                              {row.term && <hr className="border-gray-300 my-2" />}
                              <div className="mb-2">
                                <div 
                                  dangerouslySetInnerHTML={{ __html: row.image }}
                                  className="max-w-48 max-h-48 overflow-hidden border rounded"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Divider line between front and back */}
                      <hr className="border-gray-400 mb-3" />
                      
                      {/* Back (Definition) */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Nghĩa</div>
                        <div className="text-gray-700">
                          {row.definition ? (
                            <div className="mb-2">
                              <div dangerouslySetInnerHTML={{ __html: row.definition }} />
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">Chưa có nội dung</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Edit controls */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          // Set up for editing this card (complete card editing)
                          setEditingCard({
                            index: idx,
                            type: 'card',
                            currentValue: {
                              term: row.term,
                              definition: row.definition,
                              image: row.image
                            },
                            currentCardSetName: cardSetName,
                            currentCardSetId: createdCardSetId || cardSetId || searchParams.get('cardSetId')
                          });
                          setShowAddCardModal(true);
                        }}
                        className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 transition"
                      >
                        Sửa thẻ
                      </button>
                      
                      {rows.length > 2 && (
                        <button 
                          onClick={() => {
                            if (!confirm("Bạn có chắc chắn muốn xóa thẻ này?")) return;
                            
                            // Remove from local state only - don't delete from database yet
                            const newRows = rows.filter((_, i) => i !== idx);
                            setRows(newRows);
                            setHasUnsavedChanges(true);
                          }}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm hover:bg-red-200 transition"
                        >
                          Xóa thẻ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                // Add new card to local state only - don't create in database yet
                setRows([...rows, { term: "", definition: "", image: "" }]);
                setHasUnsavedChanges(true);
              }}
              className="mt-4 px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
            >
              + Thêm thẻ mới
            </button>
          </div>
        )}
        
        <button
          className={`mt-2 px-6 py-2 rounded-full font-semibold transition ${cardSetName ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          onClick={() => cardSetName && handleAddCardToSet()}
          disabled={!cardSetName}
        >
          Thêm thẻ
        </button>
        {/* Modal thêm card giống TopBar */}
        {showAddCardModal && ( 
          <AddCardModal 
            onClose={() => {
              setShowAddCardModal(false);
              setEditingCard(null);
            }} 
            currentCardSet={cardSetName}
            cardSetId={createdCardSetId}
            editingCard={editingCard}
            onCardEdited={async (updatedCard, selectedCardSetId) => {
              if (editingCard && selectedCardSetId === (createdCardSetId || cardSetId || searchParams.get('cardSetId'))) {
                // Editing in the same card set
                try {
                  const token = localStorage.getItem("auth_token");
                  
                  if (!token) {
                    throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
                  }
                  
                  console.log("Updating card with data:", updatedCard);
                  console.log("Editing card info:", editingCard);
                  
                  if (editingCard.type === 'card') {
                    // Update local state only - don't update database yet
                    handleRowChange(editingCard.index, 'term', updatedCard.front || '');
                    handleRowChange(editingCard.index, 'definition', updatedCard.back || '');
                    if (updatedCard.image !== undefined) {
                      handleRowChange(editingCard.index, 'image', updatedCard.image || '');
                    }
                    
                  } else if (editingCard.type === 'term') {
                    handleRowChange(editingCard.index, 'term', updatedCard.front || '');
                  } else if (editingCard.type === 'definition') {
                    handleRowChange(editingCard.index, 'definition', updatedCard.back || '');
                  }
                } catch (error) {
                  console.error("Error updating card:", error);
                  console.error("Error stack:", error.stack);
                  alert("Lỗi khi cập nhật thẻ: " + error.message);
                }
              } else if (selectedCardSetId !== (createdCardSetId || cardSetId || searchParams.get('cardSetId'))) {
                // Moving to different card set - navigate there
                navigate(`/cardset/${selectedCardSetId}`);
              }
              setEditingCard(null);
            }}
          /> 
        )}

        {/* Modal Import */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-[500px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {importType === "quizlet" ? "Import từ Quizlet" : "Import từ Anki"}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowImportModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Thông báo về tên bộ thẻ */}
              <div className={`mb-4 p-3 rounded-md ${cardSetName.trim() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${cardSetName.trim() ? 'text-green-700' : 'text-yellow-700'}`}>
                  {cardSetName.trim() 
                    ? `✓ Tên bộ thẻ: "${cardSetName}"` 
                    : "⚠️ Nhập tên bộ thẻ ở trên để sử dụng tên tùy chỉnh, nếu không sẽ dùng tên mặc định"
                  }
                </p>
              </div>

              {importType === "quizlet" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Quizlet Set
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://quizlet.com/123456789/set-name-flash-cards/"
                    value={quizletUrl}
                    onChange={(e) => setQuizletUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Paste URL của Quizlet set mà bạn muốn import
                  </p>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoặc nhập dữ liệu CSV (Front,Back)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Thuật ngữ 1,Định nghĩa 1&#10;Thuật ngữ 2,Định nghĩa 2&#10;..."
                      rows="4"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoặc nhập dữ liệu JSON
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='[{"term": "Thuật ngữ", "definition": "Định nghĩa"}, ...]'
                      rows="4"
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => setShowImportModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className={`px-6 py-2 rounded-md text-white ${
                        isImporting 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      onClick={handleImportFromQuizlet}
                      disabled={isImporting}
                    >
                      {isImporting ? "Đang import..." : "Import"}
                    </button>
                  </div>
                </div>
              )}

              {importType === "anki" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Anki (.apkg hoặc .txt)
                  </label>
                  <input
                    type="file"
                    accept=".apkg,.txt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={(e) => setAnkiFile(e.target.files[0])}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Hỗ trợ file .apkg (Anki deck) hoặc .txt (exported text)
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => setShowImportModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className={`px-6 py-2 rounded-md text-white ${
                        isImporting 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      onClick={handleImportFromAnki}
                      disabled={isImporting}
                    >
                      {isImporting ? "Đang import..." : "Import"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-4 mt-8">
          <button 
            onClick={isEditMode ? handleSave : handleCreateCardSet}
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          >
            {isEditMode ? "Lưu" : "Tạo"}
          </button>
          <button 
            onClick={isEditMode ? handleSaveAndStudy : () => {}}
            className="px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            {isEditMode ? "Lưu và ôn luyện" : "Tạo và ôn luyện"}
          </button>
        </div>
        </div>
      )}
    </div>
    );
  }