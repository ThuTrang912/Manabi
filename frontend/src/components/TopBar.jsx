import React from "react";
import manabiLogo from '../assets/manabi-logo.png';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';
import Sidebar from "./Sidebar";

export default function TopBar({ navigate }) {
  // Lấy thông tin user từ JWT token trong localStorage
  let avatarUrl = "";
  let userName = "";
  let userEmail = "";
  let userId = "";
  const token = localStorage.getItem("auth_token");
  if (token) {
    try {
      const base64 = token.split('.')[1];
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const payload = JSON.parse(jsonStr);
      userName = payload.name || "";
      userEmail = payload.email || "";
      userId = payload._id || payload.id || payload.userId || "";
      const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName || userEmail) + "&background=cccccc&color=555555&size=96";
      avatarUrl = payload.avatar || defaultAvatar;
    } catch (e) {
      const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
      avatarUrl = defaultAvatar;
      userName = "";
      userEmail = "";
      userId = "";
    }
  } else {
    const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
    avatarUrl = defaultAvatar;
    userId = "";
  }
  // UI state
  const [showMenu, setShowMenu] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const menuRef = React.useRef();
  const [showAddFolderModal, setshowAddFolderModal] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [showAddCardModal, setshowAddCardModal] = React.useState(false);
  
  
  // Card type dropdown options
  const cardTypeOptions = [
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
  // Card set dropdown options (dummy, replace with real data)
  const cardSetOptions = [
    "Japanese Core 2000 Step 01 Listening Sentence Vocab + Images",
    "Test bộ thẻ 2",
    "Test bộ thẻ mới",
    "Từ vựng tiếng anh p30(. 3000 từ thông dụng nhất) IELTS"
  ];

  // State for selected type/set, default to last used or first
  // Modal chọn bộ thẻ
  const [showSetModal, setShowSetModal] = React.useState(false);
   // Modal state for adding a new card set
  const [showAddSetModal, setShowAddSetModal] = React.useState(false);
  const [newSetName, setNewSetName] = React.useState("");
  const [setFilter, setSetFilter] = React.useState("");
  const filteredSets = cardSetOptions.filter(set => set.toLowerCase().includes(setFilter.toLowerCase()));

  // Modal chọn kiểu thẻ
  const [showTypeModal, setShowTypeModal] = React.useState(false);
  const [showTypeManagerModal, setShowTypeManagerModal] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState("");
  const filteredTypes = cardTypeOptions.filter(type => type.toLowerCase().includes(typeFilter.toLowerCase()));
  const [selectedCardType, setSelectedCardType] = React.useState(() => {
    return localStorage.getItem("lastCardType") || cardTypeOptions[3];
  });
  const [selectedCardSet, setSelectedCardSet] = React.useState(() => {
    return localStorage.getItem("lastCardSet") || cardSetOptions[0];
  });
  // const [selectedCardType, setSelectedCardType] = React.useState(cardTypeOptions[0]);
  // const [selectedCardSet, setSelectedCardSet] = React.useState(cardSetOptions[0]);

  // State for selected type/set, default to last used or first
  // Save last selected type/set
  React.useEffect(() => {
    localStorage.setItem("lastCardType", selectedCardType);
  }, [selectedCardType]);
  React.useEffect(() => {
    localStorage.setItem("lastCardSet", selectedCardSet);
  }, [selectedCardSet]);
  

  // Các trường động cho toast
  const [frontFields, setFrontFields] = React.useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = React.useState([{ id: 2, label: "Mặt sau", value: "" }]);

  // Add field for Mặt trước
  const addFrontField = () => {
    const nextId = frontFields.length ? Math.max(...frontFields.map(f => f.id)) + 1 : 1;
    setFrontFields([...frontFields, { id: nextId, label: `Trường mặt trước ${nextId}`, value: "" }]);
  };
  // Add field for Mặt sau
  const addBackField = () => {
    const nextId = backFields.length ? Math.max(...backFields.map(f => f.id)) + 1 : 1;
    setBackFields([...backFields, { id: nextId, label: `Trường mặt sau ${nextId}`, value: "" }]);
  };
  // Remove field
  const removeFrontField = (id) => {
    setFrontFields(frontFields.filter(f => f.id !== id));
  };
  const removeBackField = (id) => {
    setBackFields(backFields.filter(f => f.id !== id));
  };
  // Update field
  const updateFrontField = (id, value) => {
    setFrontFields(frontFields.map(f => f.id === id ? { ...f, value } : f));
  };
  const updateBackField = (id, value) => {
    setBackFields(backFields.map(f => f.id === id ? { ...f, value } : f));
  };

  // Danh sách thẻ đã nhập
  const [addedCards, setAddedCards] = React.useState([]);
  // Thêm trường mới
  // (Obsolete) addField removed, now handled by addFrontField/addBackField
  // Xóa trường
  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };
  // Đổi giá trị trường
  const updateField = (id, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };
  // Thêm thẻ vào danh sách
  const handleAddCard = () => {
    // Lưu thẻ hiện tại vào mảng
    setAddedCards([
      ...addedCards,
      [
        ...frontFields.map(f => ({ label: f.label, value: f.value })),
        ...backFields.map(f => ({ label: f.label, value: f.value }))
      ]
    ]);
    // Reset các trường về rỗng
    setFrontFields(frontFields.map(f => ({ ...f, value: "" })));
    setBackFields(backFields.map(f => ({ ...f, value: "" })));
  };
  return (
    <header className="flex items-center px-6 py-4 bg-white shadow-sm relative">
      {/* Hamburger menu button */}
      <button className="mr-2 text-2xl text-blue-500 focus:outline-none flex items-center justify-center" onClick={() => window.openSidebar && window.openSidebar()}>
        <Bars3Icon className="w-8 h-8 text-blue-500" />
      </button>
      {/* Sidebar component, state managed internally */}
      <Sidebar navigate={navigate} />
      {/* Logo button */}
      <button className="mr-2 focus:outline-none flex items-center justify-center" onClick={() => navigate("/")}> 
        <img src={manabiLogo} alt="Manabi Logo" style={{width: '100px', height: '60px', objectFit: 'contain'}} />
      </button>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Tìm kiếm bài kiểm tra thử"
          className="w-full px-4 py-2 rounded bg-gray-100 focus:outline-none"
        />
      </div>
      <div className="ml-4 relative">
        <button className="px-4 py-2 bg-blue-400 text-white rounded-full font-semibold hover:bg-blue-500 transition" onClick={() => setShowAdd(v => !v)}>
          + Tạo mới
        </button>
        {showAdd && (
          <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg border z-50 py-2 transition-all duration-200 ease-out" style={{transform: 'translateY(-10px)', opacity: 1, pointerEvents: 'auto'}}>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {
              e.stopPropagation();
              setShowAdd(false);
              setshowAddCardModal(true);
            }}>
              <span className="material-icons">style</span> Thẻ
            </button>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false); navigate(`/add-cardset`);}}>
              <span className="material-icons">library_books</span> Bộ thẻ
            </button>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false); setshowAddFolderModal(true);}}>
              <span className="material-icons">folder</span> Thư mục
            </button>
          </div>
        )}
        {/* Toast cho nút Thẻ */}
        {showAddCardModal && (
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
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setshowAddCardModal(false)} title="Đóng">
                <span className="material-icons text-2xl">close</span>
              </button>
              {/* Hiển thị số thẻ đã thêm */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Đã thêm <b>{addedCards.length}</b> thẻ</span>
                {addedCards.length > 0 && (
                  <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs" onClick={() => { setshowAddCardModal(false); setAddedCards([]); }}>
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
                  <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"><span className="material-icons">info</span>Tùy chỉnh trường tin</button>
                  <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"><span className="material-icons">style</span>Tùy chỉnh mẫu thẻ</button>
                </div>
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
                <button className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold" onClick={() => setshowAddCardModal(false)}>Đóng</button>
                <button
                  className={`px-6 py-2 rounded font-semibold ${frontFields[0].value ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!frontFields[0].value}
                  onClick={handleAddCard}
                >Thêm</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal tạo Thư mục */}
        {showAddFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] flex flex-col items-center relative">
              <span className="material-icons text-5xl text-gray-500 mb-4">folder</span>
              <input
                type="text"
                className="w-full text-center text-lg font-semibold mb-6 px-4 py-2 bg-gray-100 rounded focus:outline-none"
                placeholder="Đặt tên cho Thư mục của bạn"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
              />
              <div className="flex gap-4 mt-2">
                <button className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold" onClick={() => { setshowAddFolderModal(false); setFolderName(""); }}>Hủy</button>
                <button
                  className={`px-6 py-2 rounded font-semibold ${folderName ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!folderName}
                  onClick={async () => {
                    if (!userId) {
                      alert("Không tìm thấy userId!");
                      return;
                    }
                    // Gọi API tạo folder
                    try {
                      const res = await fetch("http://localhost:5001/api/folders", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name: folderName, userId })
                      });
                      if (!res.ok) throw new Error("Tạo thư mục thất bại");
                      const folder = await res.json();
                      setshowAddFolderModal(false);
                      setFolderName("");
                      // Chuyển hướng với path user/userid/folder/folderid
                      navigate(`/user/${userName}/folder/${folder._id}`, { state: { folderName: folder.name } });
                    } catch (err) {
                      alert("Lỗi: " + err.message);
                    }
                  }}
                >Tạo</button>
              </div>
              {/* Nút đóng góc */}
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setshowAddFolderModal(false)} title="Đóng">
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="ml-4 relative">
        <div ref={menuRef} className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer" onClick={() => setShowMenu(v => !v)}>
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        </div>
        {showMenu && (
          <UserMenu
            avatarUrl={avatarUrl}
            userName={userName}
            userEmail={userEmail}
            setShowMenu={setShowMenu}
          />
        )}
      </div>
    </header>
  );
}
