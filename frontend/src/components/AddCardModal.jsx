
import React from "react";

export default function AddCardModal({ onClose, currentCardSet }) {
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
  const [cardSetOptions] = React.useState(cardSetOptionsDefault);
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
    return localStorage.getItem("lastCardSet") || cardSetOptionsDefault[0];
  });
  React.useEffect(() => {
    localStorage.setItem("lastCardType", selectedCardType);
  }, [selectedCardType]);
  React.useEffect(() => {
    localStorage.setItem("lastCardSet", selectedCardSet);
  }, [selectedCardSet]);
  const [frontFields, setFrontFields] = React.useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = React.useState([{ id: 2, label: "Mặt sau", value: "" }]);
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
  const handleAddCard = () => {
    setAddedCards([
      ...addedCards,
      [
        ...frontFields.map(f => ({ label: f.label, value: f.value })),
        ...backFields.map(f => ({ label: f.label, value: f.value }))
      ]
    ]);
    setFrontFields(frontFields.map(f => ({ ...f, value: "" })));
    setBackFields(backFields.map(f => ({ ...f, value: "" })));
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
          {addedCards.length > 0 && (
            <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs" onClick={() => { onClose(); setAddedCards([]); }}>
              Đóng & Xem danh sách thẻ
            </button>
          )}
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
                    <button
                      className="px-2 py-1 rounded border text-sm w-full min-w-0 bg-white text-left"
                      onClick={() => setShowSetModal(true)}
                    >
                      {selectedCardSet || "-- Chọn bộ thẻ --"}
                    </button>
                    {showSetModal && (
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
                                  onClick={() => {
                                    if (!newSetName.trim()) return;
                                    // Add to cardSetOptions (dummy, replace with API if needed)
                                    if (!cardSetOptions.includes(newSetName.trim())) {
                                      cardSetOptions.unshift(newSetName.trim());
                                    }
                                    setSelectedCardSet(newSetName.trim());
                                    setShowAddSetModal(false);
                                    setNewSetName("");
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
                              {filteredSets.map((set, idx) => (
                                <div
                                  key={idx}
                                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${selectedCardSet === set ? 'bg-blue-200 font-semibold' : ''}`}
                                  onClick={() => setSelectedCardSet(set)}
                                >
                                  {set}
                                </div>
                              ))}
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
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn hình"><span className="material-icons">image</span></button>
                <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn âm thanh"><span className="material-icons">mic</span></button>
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
                      <input
                        className="w-full px-4 py-2 rounded border text-lg"
                        placeholder={field.label}
                        value={field.value}
                        onChange={e => updateFrontField(field.id, e.target.value)}
                      />
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
                      <input
                        className="w-full px-4 py-2 rounded border text-lg"
                        placeholder={field.label}
                        value={field.value}
                        onChange={e => updateBackField(field.id, e.target.value)}
                      />
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
          </div>
  );
}