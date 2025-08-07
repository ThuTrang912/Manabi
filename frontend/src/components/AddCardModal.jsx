
import React from "react";

export default function AddCardModal({ onClose, currentCardSet, cardSetId }) {
  // All state and handlers are now internal
  // Modal chỉnh sửa mẫu thẻ
  const [showTemplateEditor, setShowTemplateEditor] = React.useState(false);
  // Dữ liệu mẫu thẻ (template)
  const [templateType, setTemplateType] = React.useState(0);
  const [templateText, setTemplateText] = React.useState("{{FrontText}}\n<br><br>\n{{FrontAudio}}");
  const [previewSide, setPreviewSide] = React.useState("front");

  const cardTypeOptionsDefault = [
  "Basic Quizlet Extended",
  "Cơ bản",
  "Cơ bản (nhập câu trả lời)",
  "Cơ bản (thẻ ngược tuỳ chọn)",
  "Cơ bản (với thẻ ngược)",
  "Image Occlusion",
  "iKnow! Sentences",
  "iKnow! Vocabulary",
  "Điền chỗ trống"
];
  const cardSetOptionsDefault = [
  "Japanese Core 2000 Step 01 Listening Sentence Vocab + Images",
  "Test bộ thẻ 2",
  "Test bộ thẻ mới",
  "Từ vựng tiếng anh p30(. 3000 từ thông dụng nhất) IELTS"
];

  const [addedCards, setAddedCards] = React.useState([]);
  const [cardTypeOptions] = React.useState(cardTypeOptionsDefault);
  const [cardSetOptions, setCardSetOptions] = React.useState([]);
  const [cardSetsData, setCardSetsData] = React.useState([]); // Store full card set objects
  const [loadingCardSets, setLoadingCardSets] = React.useState(false);
  const [showTypeModal, setShowTypeModal] = React.useState(false);
  const [showTypeManagerModal, setShowTypeManagerModal] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState("");
  const filteredTypes = cardTypeOptions.filter(type => type.toLowerCase().includes(typeFilter.toLowerCase()));
  const [selectedCardType, setSelectedCardType] = React.useState(() => {
    return localStorage.getItem("lastCardType") || cardTypeOptionsDefault[3];
  });
  const [showSetModal, setShowSetModal] = React.useState(false);
  const [showAddSetModal, setShowAddSetModal] = React.useState(false);
  const [newSetName, setNewSetName] = React.useState("");
  const [setFilter, setSetFilter] = React.useState("");
  const filteredSets = cardSetOptions.filter(set => set.toLowerCase().includes(setFilter.toLowerCase()));
  const [selectedCardSet, setSelectedCardSet] = React.useState(() => {
    if (currentCardSet) return currentCardSet;
    return localStorage.getItem("lastCardSet") || "";
  });
  
  // Ensure currentCardSet is always used when provided
  React.useEffect(() => {
    if (currentCardSet) {
      setSelectedCardSet(currentCardSet);
    }
  }, [currentCardSet]);
  
  // Load card sets from database
  React.useEffect(() => {
    fetchCardSets();
  }, []);
  
  const fetchCardSets = async () => {
    setLoadingCardSets(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        console.log("No auth token found");
        setLoadingCardSets(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/cards/sets", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch card sets");
      }

      const data = await response.json();
      const cardSetNames = data.cardSets.map(set => set.name);
      setCardSetOptions(cardSetNames);
      setCardSetsData(data.cardSets); // Store full objects for ID lookup
      
      // If no currentCardSet is provided and we have card sets, set the first one as default
      if (!currentCardSet && cardSetNames.length > 0 && !localStorage.getItem("lastCardSet")) {
        setSelectedCardSet(cardSetNames[0]);
      }
      
    } catch (error) {
      console.error("Error fetching card sets:", error);
      // Fallback to empty array if error
      setCardSetOptions([]);
    } finally {
      setLoadingCardSets(false);
    }
  };
  React.useEffect(() => {
    localStorage.setItem("lastCardType", selectedCardType);
  }, [selectedCardType]);
  React.useEffect(() => {
    localStorage.setItem("lastCardSet", selectedCardSet);
  }, [selectedCardSet]);
  const [frontFields, setFrontFields] = React.useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = React.useState([{ id: 2, label: "Mặt sau", value: "" }]);
  
  // States for image and audio functionality
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showAudioModal, setShowAudioModal] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState(null);
  const [audioBlob, setAudioBlob] = React.useState(null);
  const [currentFieldForMedia, setCurrentFieldForMedia] = React.useState(null); // Track which field to add media to
  
  // Modal chỉnh sửa trường tin
  const [showFieldEditor, setShowFieldEditor] = React.useState(false);
  // Danh sách trường tin động (gộp front/back cho modal chỉnh sửa)
  const [fieldDefs, setFieldDefs] = React.useState([
    { id: 1, label: "Mặt trước" },
    { id: 2, label: "Mặt sau" },
    { id: 3, label: "giải thích" },
    { id: 4, label: "ví dụ" }
  ]);
  // Để chọn trường đang chọn trong modal
  const [selectedFieldIdx, setSelectedFieldIdx] = React.useState(0);
  const [renameValue, setRenameValue] = React.useState("");
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
  
  // Image handling functions
  const handleImageUpload = () => {
    setShowImageModal(true);
  };
  
  const handleImageFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (currentFieldForMedia) {
          // Add image to current field with proper styling
          const { type, id } = currentFieldForMedia;
          const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 200px; height: auto; border-radius: 8px; margin: 8px 0; display: block; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" />`;
          
          if (type === 'front') {
            const currentField = frontFields.find(f => f.id === id);
            const textContent = currentField.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
            updateFrontField(id, textContent + imageHtml);
          } else {
            const currentField = backFields.find(f => f.id === id);
            const textContent = currentField.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
            updateBackField(id, textContent + imageHtml);
          }
        }
        setShowImageModal(false);
        setSelectedFile(null);
        setCurrentFieldForMedia(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Audio recording functions
  const handleAudioRecording = async () => {
    setShowAudioModal(true);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Convert to base64 and add to field
        const reader = new FileReader();
        reader.onload = (e) => {
          const audioUrl = e.target.result;
          if (currentFieldForMedia) {
            const { type, id } = currentFieldForMedia;
            const audioHtml = `<audio controls style="margin: 8px 0; display: block; max-width: 300px;"><source src="${audioUrl}" type="audio/wav">Your browser does not support audio.</audio>`;
            
            if (type === 'front') {
              const currentField = frontFields.find(f => f.id === id);
              const textContent = currentField.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
              updateFrontField(id, textContent + audioHtml);
            } else {
              const currentField = backFields.find(f => f.id === id);
              const textContent = currentField.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
              updateBackField(id, textContent + audioHtml);
            }
          }
          setShowAudioModal(false);
          setAudioBlob(null);
          setCurrentFieldForMedia(null);
        };
        reader.readAsDataURL(audioBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };
  
  const handleAddCard = () => {
    // Add to local state only - user will save all at once
    setAddedCards([
      ...addedCards,
      [
        ...frontFields.map(f => ({ label: f.label, value: f.value })),
        ...backFields.map(f => ({ label: f.label, value: f.value }))
      ]
    ]);
    
    // Clear input fields
    setFrontFields(frontFields.map(f => ({ ...f, value: "" })));
    setBackFields(backFields.map(f => ({ ...f, value: "" })));
  };

  const saveCardToDatabase = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        alert("Vui lòng đăng nhập trước khi thêm thẻ");
        return;
      }

      let targetCardSetId = cardSetId;

      // If no cardSetId provided, find it from selectedCardSet name or currentCardSet
      if (!targetCardSetId) {
        const cardSetName = selectedCardSet || currentCardSet;
        console.log("Trying to find card set with name:", cardSetName);
        console.log("Available card sets:", cardSetsData.map(s => s.name));
        
        if (!cardSetName) {
          alert("Vui lòng chọn bộ thẻ trước khi thêm thẻ");
          return;
        }

        // First try to find existing card set
        const selectedCardSetData = cardSetsData.find(set => set.name === cardSetName);
        if (selectedCardSetData) {
          console.log("Found existing card set:", selectedCardSetData.name, "with ID:", selectedCardSetData._id);
          targetCardSetId = selectedCardSetData._id;
        } else {
          console.log("Card set not found, creating new one with name:", cardSetName);
          // If card set doesn't exist, create it first
          const cardSetResponse = await fetch("http://localhost:5001/api/cards/sets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: cardSetName,
              description: `Bộ thẻ được tạo từ AddCardModal`,
              source: "manual"
            }),
          });

          if (cardSetResponse.status === 409) {
            // Card set already exists, get it from response
            const existingData = await cardSetResponse.json();
            console.log("Card set already exists, using existing one:", existingData.cardSet.name);
            targetCardSetId = existingData.cardSet._id;
            
            // Refresh card sets list to make sure we have the latest data
            await fetchCardSets();
          } else if (!cardSetResponse.ok) {
            throw new Error("Failed to create card set");
          } else {
            const cardSetData = await cardSetResponse.json();
            targetCardSetId = cardSetData.cardSet._id;
            console.log("Created new card set with ID:", targetCardSetId);
            
            // Refresh card sets list
            await fetchCardSets();
          }
        }
      }

      const response = await fetch(`http://localhost:5001/api/cards/sets/${targetCardSetId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          frontFields: frontFields.filter(f => f.value.trim()),
          backFields: backFields.filter(f => f.value.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save card");
      }

      const data = await response.json();
      console.log("Card saved successfully:", data);
      
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Lỗi khi lưu thẻ: " + error.message);
    }
  };

  const saveAllCardsToDatabase = async () => {
    if (!cardSetId) {
      // If no cardSetId, we need to find it from selectedCardSet name or currentCardSet or create new one
      const cardSetName = selectedCardSet || currentCardSet;
      if (!cardSetName) {
        alert("Vui lòng chọn bộ thẻ hoặc tạo bộ thẻ mới");
        return;
      }

      // Find card set ID by name
      const selectedCardSetData = cardSetsData.find(set => set.name === cardSetName);
      if (!selectedCardSetData) {
        // Card set doesn't exist, create new one
        await createCardSetAndSaveCards();
        return;
      }

      // Use the found card set ID
      const foundCardSetId = selectedCardSetData._id;

      try {
        const token = localStorage.getItem("auth_token");
        
        if (!token) {
          alert("Vui lòng đăng nhập trước khi lưu thẻ");
          return;
        }

        // Convert addedCards to the format expected by backend
        const cardsToSave = addedCards.map(cardFields => {
          const frontFields = cardFields.filter(f => f.label.includes("trước") || f.label.includes("Mặt trước"));
          const backFields = cardFields.filter(f => f.label.includes("sau") || f.label.includes("Mặt sau"));
          
          return {
            frontFields: frontFields.length ? frontFields : [{ label: "Mặt trước", value: cardFields[0]?.value || "" }],
            backFields: backFields.length ? backFields : [{ label: "Mặt sau", value: cardFields[1]?.value || "" }],
          };
        });

        const response = await fetch(`http://localhost:5001/api/cards/sets/${foundCardSetId}/cards/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            cards: cardsToSave,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save cards");
        }

        const data = await response.json();
        alert(`Đã lưu thành công ${data.count} thẻ vào bộ thẻ "${selectedCardSet}"!`);
        setAddedCards([]); // Clear local state
        onClose();
        
      } catch (error) {
        console.error("Error saving cards:", error);
        alert("Lỗi khi lưu thẻ: " + error.message);
      }
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        alert("Vui lòng đăng nhập trước khi lưu thẻ");
        return;
      }

      // Convert addedCards to the format expected by backend
      const cardsToSave = addedCards.map(cardFields => {
        const frontFields = cardFields.filter(f => f.label.includes("trước") || f.label.includes("Mặt trước"));
        const backFields = cardFields.filter(f => f.label.includes("sau") || f.label.includes("Mặt sau"));
        
        return {
          frontFields: frontFields.length ? frontFields : [{ label: "Mặt trước", value: cardFields[0]?.value || "" }],
          backFields: backFields.length ? backFields : [{ label: "Mặt sau", value: cardFields[1]?.value || "" }],
        };
      });

      const response = await fetch(`http://localhost:5001/api/cards/sets/${cardSetId}/cards/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          cards: cardsToSave,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save cards");
      }

      const data = await response.json();
      alert(`Đã lưu thành công ${data.count} thẻ!`);
      setAddedCards([]); // Clear local state
      onClose();
      
    } catch (error) {
      console.error("Error saving cards:", error);
      alert("Lỗi khi lưu thẻ: " + error.message);
    }
  };

  const createCardSetAndSaveCards = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        alert("Vui lòng đăng nhập trước khi tạo bộ thẻ");
        return;
      }

      const cardSetName = selectedCardSet || currentCardSet || "Bộ thẻ mới";
      
      // Create card set first
      const cardSetResponse = await fetch("http://localhost:5001/api/cards/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cardSetName,
          description: `Bộ thẻ được tạo từ AddCardModal`,
          source: "manual"
        }),
      });

      let newCardSetId;
      
      if (cardSetResponse.status === 409) {
        // Card set already exists, get it from response
        const existingData = await cardSetResponse.json();
        console.log("Card set already exists, using existing one:", existingData.cardSet.name);
        newCardSetId = existingData.cardSet._id;
      } else if (!cardSetResponse.ok) {
        const errorData = await cardSetResponse.json();
        throw new Error(errorData.message || "Failed to create card set");
      } else {
        const cardSetData = await cardSetResponse.json();
        newCardSetId = cardSetData.cardSet._id;
        console.log("Created new card set with ID:", newCardSetId);
      }

      // Refresh card sets list
      await fetchCardSets();

      // Now save all cards to the card set
      if (addedCards.length > 0) {
        const cardsToSave = addedCards.map(cardFields => {
          const frontFields = cardFields.filter(f => f.label.includes("trước") || f.label.includes("Mặt trước"));
          const backFields = cardFields.filter(f => f.label.includes("sau") || f.label.includes("Mặt sau"));
          
          return {
            frontFields: frontFields.length ? frontFields : [{ label: "Mặt trước", value: cardFields[0]?.value || "" }],
            backFields: backFields.length ? backFields : [{ label: "Mặt sau", value: cardFields[1]?.value || "" }],
          };
        });

        const cardsResponse = await fetch(`http://localhost:5001/api/cards/sets/${newCardSetId}/cards/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            cards: cardsToSave,
          }),
        });

        if (!cardsResponse.ok) {
          throw new Error("Failed to save cards to card set");
        }

        const cardsData = await cardsResponse.json();
        alert(`Đã lưu thành công ${cardsData.count} thẻ vào bộ thẻ "${cardSetName}"!`);
      } else {
        alert(`Đã sử dụng bộ thẻ "${cardSetName}" thành công!`);
      }
      
      setAddedCards([]); // Clear local state
      onClose();
      
      // Optionally redirect to the card set
      if (window.location.pathname.includes('/cardset/')) {
        window.location.href = `/cardset/${newCardSetId}`;
      }
      
    } catch (error) {
      console.error("Error creating card set and saving cards:", error);
      alert("Lỗi khi tạo bộ thẻ: " + error.message);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div
        className="bg-white rounded-xl shadow-lg px-6 py-6 flex flex-col gap-4 border relative"
        style={{
          width: '1000px',
          maxWidth: 'calc(100vw - 32px)',
          minWidth: '600px',
          maxHeight: '100vh',
          overflowY: 'auto',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {/* Nút đóng ở góc */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose} title="Đóng">
          <span className="material-icons text-2xl">close</span>
        </button>
        {/* Hiển thị số thẻ đã thêm */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Đã thêm <b>{addedCards.length}</b> thẻ</span>
          <div className="flex gap-2">
            {addedCards.length > 0 && (
              <button 
                className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs hover:bg-green-200" 
                onClick={cardSetId ? saveAllCardsToDatabase : createCardSetAndSaveCards}
              >
                Lưu tất cả thẻ
              </button>
            )}
            {addedCards.length > 0 && (
              <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs" onClick={() => { onClose(); setAddedCards([]); }}>
                Đóng & Xem danh sách thẻ
              </button>
            )}
          </div>
        </div>
              {/* Thanh chức năng phía trên */}
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                {/* Hàng 1: input Kiểu và Thư mục */}
                <div className="flex w-full gap-4 mb-2">
                  <div className="flex flex-col relative" style={{flex: 4.5}}>
                    <label className="text-xs text-gray-500 mb-1">Kiểu</label>
                    <button
                      className="px-2 py-1 rounded border text-sm w-full min-w-0 bg-white text-left"
                      onClick={() => setShowTypeModal(true)}
                    >
                      {selectedCardType}
                    </button>
                    {showTypeModal && (
                      <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-50 p-4 flex flex-col w-full overflow-hidden" style={{width: '100%'}}>
                        {showTypeManagerModal ? (
                          <>
                            <div className="font-semibold mb-2">Các Kiểu Phiếu</div>
                            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-row gap-4 relative border w-full" style={{minHeight: 320, maxHeight: 400}}>
                              {/* Danh sách kiểu phiếu */}
                              <div className="flex-1 flex flex-col">                                
                                <div className="border rounded bg-gray-50 flex-1 mb-2 overflow-y-auto" style={{minWidth: 100, maxWidth: 230, minHeight: 200, maxHeight: 260}}>
                                  <ul className="w-full">
                                    {cardTypeOptions.map((type, idx) => (
                                      <li
                                        key={idx}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${selectedCardType === type ? 'bg-blue-200 font-semibold' : ''}`}
                                        onClick={() => setSelectedCardType(type)}
                                      >
                                        {type} {idx === 0 && <span className="text-xs text-gray-400">[41 phiếu]</span>}
                                        {idx === 1 && <span className="text-xs text-gray-400">[5 phiếu]</span>}
                                        {idx === 2 && <span className="text-xs text-gray-400">[0 phiếu]</span>}
                                        {idx === 3 && <span className="text-xs text-gray-400">[2 phiếu]</span>}
                                        {idx === 4 && <span className="text-xs text-gray-400">[0 phiếu]</span>}
                                        {idx === 5 && <span className="text-xs text-gray-400">[200 phiếu]</span>}
                                        {idx === 6 && <span className="text-xs text-gray-400">[200 phiếu]</span>}
                                        {idx === 7 && <span className="text-xs text-gray-400">[0 phiếu]</span>}
                                        {idx === 8 && <span className="text-xs text-gray-400">[0 phiếu]</span>}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              {/* Cột nút chức năng */}
                              <div className="flex flex-col gap-2 justify-start" style={{width:120, flexShrink: 0}}>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => alert('Thêm')}>Thêm</button>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => alert('Đổi tên')}>Đổi tên</button>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => alert('Xóa')}>Xóa</button>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => alert('Tùy chọn')}>Tùy chọn...</button>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => setShowTypeManagerModal(false)}>Close</button>
                                <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden w-24" style={{width: 105}} onClick={() => alert('Help')}>Help</button>
                              </div>
                              {/* Nút đóng góc
                              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTypeManagerModal(false)} title="Đóng">
                                <span className="material-icons text-2xl">close</span>
                              </button> */}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold mb-2">Chọn Kiểu Phiếu</div>
                            <input
                              type="text"
                              className="w-full mb-2 px-2 py-1 rounded border text-sm"
                              placeholder="Lọc..."
                              value={typeFilter}
                              onChange={e => setTypeFilter(e.target.value)}
                            />
                            <div className="border rounded bg-gray-50 mb-2 flex-1" style={{maxHeight: '180px', overflowY: 'auto'}}>
                              {filteredTypes.map((type, idx) => (
                                <div
                                  key={idx}
                                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${selectedCardType === type ? 'bg-blue-200 font-semibold' : ''}`}
                                  onClick={() => setSelectedCardType(type)}
                                >
                                  {type}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 justify-end mt-2 w-full">
                              <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold truncate overflow-hidden" style={{width: 80}} onClick={() => setShowTypeModal(false)} title="Chọn">Chọn</button>
                              <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold truncate overflow-hidden hover:bg-gray-200" style={{width: 80}} onClick={() => setShowTypeManagerModal(true)} title="Quản lý kiểu thẻ">Quản lý</button>
                              <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold truncate overflow-hidden hover:bg-gray-200" style={{width: 80}} onClick={() => setShowTypeModal(false)} title="Cancel">Cancel</button>
                              <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold truncate overflow-hidden hover:bg-gray-200" style={{width: 80}} onClick={() => alert('Help!')} title="Help">Help</button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col relative" style={{flex: 5.5}}>
                    <label className="text-xs text-gray-500 mb-1">Bộ thẻ</label>
                    {currentCardSet ? (
                      // Hiển thị bộ thẻ cố định khi được truyền từ bên ngoài
                      <div className="px-2 py-1 rounded border text-sm w-full min-w-0 bg-gray-100 text-left">
                        {currentCardSet} (đã chọn)
                      </div>
                    ) : (
                      // Hiển thị dropdown chọn bộ thẻ bình thường
                      <button
                        className="px-2 py-1 rounded border text-sm w-full min-w-0 bg-white text-left"
                        onClick={() => setShowSetModal(true)}
                      >
                        {loadingCardSets ? "Đang tải..." : (selectedCardSet || "-- Chọn bộ thẻ --")}
                      </button>
                    )}
                    {showSetModal && !currentCardSet && (
                      <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-50 p-4 flex flex-col" style={{width: '100%'}}>
                        {showAddSetModal ? (
                          <>
                            <div className="font-semibold mb-2">Tạo Bộ thẻ</div>
                            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center relative border w-full" >
                              {/* <div className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <span className="material-icons text-3xl text-blue-400">library_books</span>
                                Tạo Bộ thẻ
                              </div> */}
                              <label className="w-full text-sm mb-2 text-left">Tên bộ thẻ mới:</label>
                              <input
                                type="text"
                                className="w-full mb-6 px-3 py-2 rounded border text-base focus:outline-none"
                                value={newSetName}
                                onChange={e => setNewSetName(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-4 justify-end w-full">
                                <button
                                  className="px-6 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
                                  disabled={!newSetName.trim()}
                                  onClick={async () => {
                                    if (!newSetName.trim()) return;
                                    
                                    try {
                                      const token = localStorage.getItem("auth_token");
                                      
                                      if (!token) {
                                        alert("Vui lòng đăng nhập trước khi tạo bộ thẻ");
                                        return;
                                      }

                                      // Create the new card set via API
                                      const response = await fetch("http://localhost:5001/api/cards/sets", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "Authorization": `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({
                                          name: newSetName.trim(),
                                          description: `Bộ thẻ được tạo từ modal`,
                                        }),
                                      });

                                      if (!response.ok) {
                                        throw new Error("Failed to create card set");
                                      }

                                      // Refresh the card sets list
                                      await fetchCardSets();
                                      
                                      // Select the newly created card set
                                      setSelectedCardSet(newSetName.trim());
                                      setShowAddSetModal(false);
                                      setNewSetName("");
                                      
                                      alert(`Đã tạo bộ thẻ "${newSetName.trim()}" thành công!`);
                                      
                                    } catch (error) {
                                      console.error("Error creating card set:", error);
                                      alert("Lỗi khi tạo bộ thẻ: " + error.message);
                                    }
                                  }}
                                >OK</button>
                                <button
                                  className="px-6 py-1 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                                  onClick={() => {
                                    setShowAddSetModal(false);
                                    setNewSetName("");
                                  }}
                                >Cancel</button>
                            </div>
                            </div>
                          </>
                        ):(
                          <>
                            <div className="font-semibold mb-2">Chọn Bộ thẻ</div>
                            <input
                              type="text"
                              className="w-full mb-2 px-2 py-1 rounded border text-sm"
                              placeholder="Lọc..."
                              value={setFilter}
                              onChange={e => setSetFilter(e.target.value)}
                            />
                            <div className="border rounded bg-gray-50 mb-2 flex-1" style={{maxHeight: '180px', overflowY: 'auto'}}>
                              {cardSetOptions.length === 0 ? (
                                <div className="px-3 py-4 text-center text-gray-500">
                                  {loadingCardSets ? "Đang tải danh sách bộ thẻ..." : "Chưa có bộ thẻ nào. Hãy tạo bộ thẻ mới."}
                                </div>
                              ) : (
                                filteredSets.map((set, idx) => (
                                  <div
                                    key={idx}
                                    className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${selectedCardSet === set ? 'bg-blue-200 font-semibold' : ''}`}
                                    onClick={() => setSelectedCardSet(set)}
                                  >
                                    {set}
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2 justify-end mt-2 w-full">
                              <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold truncate overflow-hidden" style={{width: 80}} onClick={() => setShowSetModal(false)} title="Chọn">Chọn</button>
                              <button className="px-3 py-1 rounded bg-green-500 text-white font-semibold truncate overflow-hidden" style={{width: 80}} onClick={() => setShowAddSetModal(true)} title="Thêm bộ thẻ">Thêm</button>
                              <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden" style={{width: 80}} onClick={() => setShowSetModal(false)} title="Cancel">Cancel</button>
                              <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold truncate overflow-hidden" style={{width: 80}} onClick={() => alert('Help!')} title="Help">Help</button>
                            </div>
                          </>
                        )}

                      </div>
                    )}
                  </div>
                </div>
                {/* Hàng 2: các nút chức năng */}
                <div className="flex gap-2 flex-wrap w-full">
                  <button
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"
                    onClick={() => setShowFieldEditor(true)}
                  >
                    <span className="material-icons">info</span>Tùy chỉnh trường tin
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"
                    onClick={() => setShowTemplateEditor(true)}
                  >
                    <span className="material-icons">style</span>Tùy chỉnh mẫu thẻ
                  </button>
      {/* Modal chỉnh sửa mẫu thẻ */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[900px] flex flex-col relative">
            <div className="font-semibold mb-2">Kiểu Thẻ {selectedCardType}</div>
            <div className="flex flex-row gap-4">
              <div className="flex-1 flex flex-col">
                <label className="mb-1 text-sm font-semibold">Loại thẻ:</label>
                <select
                  className="mb-2 px-2 py-1 rounded border text-sm"
                  value={templateType}
                  onChange={e => setTemplateType(Number(e.target.value))}
                >
                  <option value={0}>1: Normal: FrontText+FrontAudio -&gt; FrontText+BackText+Image+BackAudio+...</option>
                  <option value={1}>2: ... (thêm các loại khác nếu cần)</option>
                </select>
                <label className="mb-1 text-sm font-semibold">Mẫu:</label>
                <textarea
                  className="w-full h-48 mb-2 px-2 py-1 rounded border text-sm font-mono"
                  value={templateText}
                  onChange={e => setTemplateText(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setTemplateText(templateText + "\n{{NewField}}")}>Thêm Trường tin</button>
                  <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setPreviewSide(previewSide === "front" ? "back" : "front")}>Lật</button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="mb-1 text-sm font-semibold">Xem trước</label>
                <div className="flex gap-2 mb-2">
                  <label><input type="radio" checked={previewSide === "front"} onChange={() => setPreviewSide("front")} /> Xem trước Mặt trước</label>
                  <label><input type="radio" checked={previewSide === "back"} onChange={() => setPreviewSide("back")} /> Xem trước Mặt sau</label>
                </div>
                <div className="flex-1 border rounded bg-gray-50 p-6 text-center text-gray-500 flex items-center justify-center min-h-[200px]">
                  {previewSide === "front" ? (
                    <div dangerouslySetInnerHTML={{__html: templateText.replace(/\{\{(.*?)\}\}/g, '<span style="color:#1976d2">$1</span>')}} />
                  ) : (
                    <div className="italic">Mặt sau của thẻ này trống.<br/>Thông tin bổ sung</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="px-4 py-1 rounded bg-blue-500 text-white font-semibold" onClick={() => setShowTemplateEditor(false)}>Lưu</button>
              <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setShowTemplateEditor(false)}>Hủy</button>
            </div>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTemplateEditor(false)} title="Đóng">
              <span className="material-icons text-2xl">close</span>
            </button>
          </div>
        </div>
      )}
                </div>
                {/* Modal chỉnh sửa trường tin */}
                {showFieldEditor && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] flex flex-col relative">
                      <div className="font-semibold mb-2">Các trường tin của bộ thẻ</div>
                      <div className="flex flex-row gap-2">
                        <ul className="flex-1 border rounded bg-gray-50 mb-2 overflow-y-auto" style={{minHeight: 180, maxHeight: 220}}>
                          {fieldDefs.map((field, idx) => (
                            <li
                              key={field.id}
                              className={`px-3 py-2 cursor-pointer ${selectedFieldIdx === idx ? 'bg-blue-100 font-semibold' : ''}`}
                              onClick={() => { setSelectedFieldIdx(idx); setRenameValue(field.label); }}
                            >
                              {idx+1}: {field.label}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-col gap-2 ml-2">
                          <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold w-20" onClick={() => {
                            // Thêm trường mới
                            const nextId = fieldDefs.length ? Math.max(...fieldDefs.map(f => f.id)) + 1 : 1;
                            setFieldDefs([...fieldDefs, { id: nextId, label: `Trường ${nextId}` }]);
                          }}>Thêm</button>
                          <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold w-20" onClick={() => {
                            // Xoá trường
                            if (fieldDefs.length <= 1) return;
                            const idx = selectedFieldIdx;
                            setFieldDefs(fieldDefs.filter((_, i) => i !== idx));
                            setSelectedFieldIdx(Math.max(0, idx-1));
                          }}>Xóa</button>
                          <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold w-20" onClick={() => {
                            // Đổi tên trường
                            setFieldDefs(fieldDefs.map((f, i) => i === selectedFieldIdx ? { ...f, label: renameValue } : f));
                          }}>Đổi tên</button>
                          <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold w-20" onClick={() => {
                            // Định vị lại (move up)
                            if (selectedFieldIdx > 0) {
                              const arr = [...fieldDefs];
                              [arr[selectedFieldIdx-1], arr[selectedFieldIdx]] = [arr[selectedFieldIdx], arr[selectedFieldIdx-1]];
                              setFieldDefs(arr);
                              setSelectedFieldIdx(selectedFieldIdx-1);
                            }
                          }}>Lên</button>
                          <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold w-20" onClick={() => {
                            // Định vị lại (move down)
                            if (selectedFieldIdx < fieldDefs.length-1) {
                              const arr = [...fieldDefs];
                              [arr[selectedFieldIdx+1], arr[selectedFieldIdx]] = [arr[selectedFieldIdx], arr[selectedFieldIdx+1]];
                              setFieldDefs(arr);
                              setSelectedFieldIdx(selectedFieldIdx+1);
                            }
                          }}>Xuống</button>
                        </div>
                      </div>
                      <input
                        className="w-full mt-2 px-2 py-1 rounded border text-sm"
                        placeholder="Đổi tên trường..."
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') setFieldDefs(fieldDefs.map((f, i) => i === selectedFieldIdx ? { ...f, label: renameValue } : f)); }}
                      />
                      <div className="flex gap-2 justify-end mt-4">
                        <button className="px-4 py-1 rounded bg-blue-500 text-white font-semibold" onClick={() => setShowFieldEditor(false)}>Save</button>
                        <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setShowFieldEditor(false)}>Cancel</button>
                      </div>
                      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowFieldEditor(false)} title="Đóng">
                        <span className="material-icons text-2xl">close</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Thanh nút chức năng định dạng */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Đậm"><b>B</b></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Nghiêng"><i>I</i></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Gạch dưới"><u>U</u></button>
                {/* <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Gạch ngang"><span style={{textDecoration: 'line-through'}}>S</span></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Cỡ chữ nhỏ">x<sub>2</sub></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Cỡ chữ lớn">A</button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Màu sắc"><span className="material-icons">format_color_fill</span></button> */}
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn hình" onClick={handleImageUpload}><span className="material-icons">image</span></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn âm thanh" onClick={handleAudioRecording}><span className="material-icons">mic</span></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn file"><span className="material-icons">attach_file</span></button>
                {/* <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn công thức"><span className="material-icons">functions</span></button> */}
              </div>
              {/* Các trường nhập động */}
              <div className="flex flex-col gap-2 mb-2">
                {/* Mặt trước */}
                <div className="mb-2">
                  <div className="font-semibold text-gray-700 mb-1">Mặt trước</div>
                  {frontFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <div className="w-full">
                        {/* Input field for text */}
                        <input
                          className="w-full px-4 py-2 rounded border text-lg"
                          placeholder={field.label}
                          value={field.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '')} // Remove media HTML for input display
                          onChange={e => {
                            // Preserve existing media content when updating text
                            const mediaMatch = field.value.match(/(<img[^>]*>|<audio[^>]*>.*?<\/audio>)/g);
                            const mediaContent = mediaMatch ? mediaMatch.join('') : '';
                            updateFrontField(field.id, e.target.value + mediaContent);
                          }}
                        />
                        {/* Preview area for media content */}
                        {(field.value.includes('<img') || field.value.includes('<audio')) && (
                          <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50 min-h-[50px] relative">
                            <div dangerouslySetInnerHTML={{ __html: field.value.match(/(<img[^>]*>|<audio[^>]*>.*?<\/audio>)/g)?.join('') || '' }} />
                            <button 
                              className="absolute top-1 right-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                              onClick={() => {
                                const textContent = field.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
                                updateFrontField(field.id, textContent);
                              }}
                              title="Xóa media"
                            >
                              <span className="material-icons text-xs">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {idx > 0 && (
                        <button className="px-2 py-1 rounded bg-red-100 text-red-600 text-xs" title="Xóa trường" onClick={() => removeFrontField(field.id)}>
                          <span className="material-icons">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold mb-2 w-fit self-center" onClick={addFrontField}>
                    + Thêm trường cho mặt trước
                  </button>
                  <hr className="my-2 border-gray-300" />
                </div>
                {/* Mặt sau */}
                <div className="mb-2">
                  <div className="font-semibold text-gray-700 mb-1">Mặt sau</div>
                  {backFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <div className="w-full">
                        {/* Input field for text */}
                        <input
                          className="w-full px-4 py-2 rounded border text-lg"
                          placeholder={field.label}
                          value={field.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '')} // Remove media HTML for input display
                          onChange={e => {
                            // Preserve existing media content when updating text
                            const mediaMatch = field.value.match(/(<img[^>]*>|<audio[^>]*>.*?<\/audio>)/g);
                            const mediaContent = mediaMatch ? mediaMatch.join('') : '';
                            updateBackField(field.id, e.target.value + mediaContent);
                          }}
                        />
                        {/* Preview area for media content */}
                        {(field.value.includes('<img') || field.value.includes('<audio')) && (
                          <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50 min-h-[50px] relative">
                            <div dangerouslySetInnerHTML={{ __html: field.value.match(/(<img[^>]*>|<audio[^>]*>.*?<\/audio>)/g)?.join('') || '' }} />
                            <button 
                              className="absolute top-1 right-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                              onClick={() => {
                                const textContent = field.value.replace(/<img[^>]*>|<audio[^>]*>.*?<\/audio>/g, '');
                                updateBackField(field.id, textContent);
                              }}
                              title="Xóa media"
                            >
                              <span className="material-icons text-xs">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {idx > 0 && (
                        <button className="px-2 py-1 rounded bg-red-100 text-red-600 text-xs" title="Xóa trường" onClick={() => removeBackField(field.id)}>
                          <span className="material-icons">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold mb-2 w-fit self-center" onClick={addBackField}>
                    + Thêm trường cho mặt sau
                  </button>
                  <hr className="my-2 border-gray-300" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <button className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold" onClick={onClose}>Đóng</button>
                <button
                  className={`px-6 py-2 rounded font-semibold ${frontFields[0].value ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!frontFields[0].value}
                  onClick={handleAddCard ? handleAddCard : () => {}}
                >Thêm</button>
              </div>
            </div>
          
            {/* Image Upload Modal */}
            {showImageModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] flex flex-col relative">
                  <div className="font-semibold mb-4">Thêm hình ảnh</div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Chọn trường để thêm hình ảnh:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Mặt trước:</p>
                        {frontFields.map((field) => (
                          <button
                            key={field.id}
                            className="w-full px-2 py-1 mb-1 text-left rounded bg-gray-100 hover:bg-blue-100 text-sm"
                            onClick={() => setCurrentFieldForMedia({ type: 'front', id: field.id })}
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Mặt sau:</p>
                        {backFields.map((field) => (
                          <button
                            key={field.id}
                            className="w-full px-2 py-1 mb-1 text-left rounded bg-gray-100 hover:bg-blue-100 text-sm"
                            onClick={() => setCurrentFieldForMedia({ type: 'back', id: field.id })}
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {currentFieldForMedia && (
                      <div className="mt-4">
                        <p className="text-sm text-green-600 mb-2">
                          Đã chọn: {currentFieldForMedia.type === 'front' ? 'Mặt trước' : 'Mặt sau'} - {
                            currentFieldForMedia.type === 'front' 
                              ? frontFields.find(f => f.id === currentFieldForMedia.id)?.label
                              : backFields.find(f => f.id === currentFieldForMedia.id)?.label
                          }
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={() => {
                        setShowImageModal(false);
                        setSelectedFile(null);
                        setCurrentFieldForMedia(null);
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                  
                  <button 
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" 
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedFile(null);
                      setCurrentFieldForMedia(null);
                    }}
                  >
                    <span className="material-icons text-2xl">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Audio Recording Modal */}
            {showAudioModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] flex flex-col relative">
                  <div className="font-semibold mb-4">Ghi âm</div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Chọn trường để thêm âm thanh:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Mặt trước:</p>
                        {frontFields.map((field) => (
                          <button
                            key={field.id}
                            className="w-full px-2 py-1 mb-1 text-left rounded bg-gray-100 hover:bg-blue-100 text-sm"
                            onClick={() => setCurrentFieldForMedia({ type: 'front', id: field.id })}
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Mặt sau:</p>
                        {backFields.map((field) => (
                          <button
                            key={field.id}
                            className="w-full px-2 py-1 mb-1 text-left rounded bg-gray-100 hover:bg-blue-100 text-sm"
                            onClick={() => setCurrentFieldForMedia({ type: 'back', id: field.id })}
                          >
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {currentFieldForMedia && (
                      <div className="mt-4">
                        <p className="text-sm text-green-600 mb-2">
                          Đã chọn: {currentFieldForMedia.type === 'front' ? 'Mặt trước' : 'Mặt sau'} - {
                            currentFieldForMedia.type === 'front' 
                              ? frontFields.find(f => f.id === currentFieldForMedia.id)?.label
                              : backFields.find(f => f.id === currentFieldForMedia.id)?.label
                          }
                        </p>
                        
                        <div className="text-center">
                          {!isRecording ? (
                            <button
                              className="px-6 py-3 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 mx-auto"
                              onClick={startRecording}
                            >
                              <span className="material-icons">mic</span>
                              Bắt đầu ghi âm
                            </button>
                          ) : (
                            <button
                              className="px-6 py-3 rounded-full bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2 mx-auto"
                              onClick={stopRecording}
                            >
                              <span className="material-icons">stop</span>
                              Dừng ghi âm
                            </button>
                          )}
                          
                          {isRecording && (
                            <p className="text-red-500 text-sm mt-2">🔴 Đang ghi âm...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={() => {
                        setShowAudioModal(false);
                        setAudioBlob(null);
                        setCurrentFieldForMedia(null);
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                  
                  <button 
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" 
                    onClick={() => {
                      setShowAudioModal(false);
                      setAudioBlob(null);
                      setCurrentFieldForMedia(null);
                    }}
                  >
                    <span className="material-icons text-2xl">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) 
      }