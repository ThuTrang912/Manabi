import TopBar from "../components/TopBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddCardModal from "../components/AddCardModal";

export default function AddCardSetPage() {
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
  const [createdCardSetId, setCreatedCardSetId] = useState(null); // Store created card set ID
  
  // Import states
  const [quizletUrl, setQuizletUrl] = useState("");
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [ankiFile, setAnkiFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const [frontFields, setFrontFields] = useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = useState([{ id: 2, label: "Mặt sau", value: "" }]);
  const navigate = useNavigate();

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
            description: desc || `Bộ thẻ được tạo từ AddCardSetPage`,
            source: "manual"
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409 && errorData.cardSet) {
            // Card set already exists, use the existing one
            cardSetId = errorData.cardSet._id;
            setCreatedCardSetId(cardSetId);
            console.log("Using existing card set:", errorData.cardSet.name, "with ID:", cardSetId);
          } else {
            throw new Error(errorData.message || "Failed to create card set");
          }
        } else {
          const data = await response.json();
          cardSetId = data.cardSet._id;
          setCreatedCardSetId(cardSetId);
          console.log("Created new card set:", cardSetName, "with ID:", cardSetId);
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
      
      // Force log to see what's being sent
      console.log("=== FRONTEND DEBUG ===");
      console.log("cardSetName value:", `"${cardSetName}"`);
      console.log("cardSetName.trim():", `"${cardSetName.trim()}"`);
      console.log("finalCustomName:", `"${finalCustomName}"`);
      console.log("Will add customName to request?", !!finalCustomName);
      console.log("requestBody:", requestBody);
      console.log("=== END FRONTEND DEBUG ===");
      
      console.log("Frontend - Sending import request with:", {
        cardSetName: cardSetName,
        customName: requestBody.customName,
        requestBody
      });
      
      const response = await fetch("http://localhost:5001/api/cards/import/quizlet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      console.log("Frontend - Received response:", {
        response: response.status,
        data: data,
        cardSetName: data.cardSet?.name,
        expectedName: finalCustomName
      });
      
      // Alert if name doesn't match expectation
      if (finalCustomName && data.cardSet?.name !== finalCustomName) {
        console.error("❌ NAME MISMATCH!", {
          expected: finalCustomName,
          received: data.cardSet?.name
        });
      } else if (finalCustomName) {
        console.log("✅ NAME MATCHES!", finalCustomName);
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
      
      console.log("Frontend - Sending Anki import with:", {
        cardSetName: cardSetName,
        deckName: deckName,
        hasFile: !!ankiFile
      });
      
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
      
      console.log("Frontend - Anki import response:", {
        response: response.status,
        data: data,
        cardSetName: data.cardSet?.name
      });
      
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
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar navigate={navigate} />
      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold mb-2">Tạo một Bộ thẻ mới</h2>
        <div className="mb-4 text-gray-500 text-sm">Đã lưu chưa đầy 1 phút trước</div>
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
        {/* {rows.map((row, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                className="w-full px-3 py-2 rounded border mb-2"
                placeholder="Thuật ngữ"
                value={row.term}
                onChange={e => handleRowChange(idx, "term", e.target.value)}
              />
              <input
                className="w-full px-3 py-2 rounded border"
                placeholder="Định nghĩa"
                value={row.definition}
                onChange={e => handleRowChange(idx, "definition", e.target.value)}
              />
            </div>
            <div>
              <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold">
                Hình ảnh
              </button>
            </div>
          </div>
        ))} */}
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
            onClose={() => setShowAddCardModal(false)} 
            currentCardSet={cardSetName}
            cardSetId={createdCardSetId}
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
          <button className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Tạo</button>
          <button className="px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">Tạo và ôn luyện</button>
        </div>
      </div>
    </div>
    );
  }