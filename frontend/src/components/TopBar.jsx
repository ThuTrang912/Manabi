import React from "react";
import manabiLogo from '../assets/manabi-logo.png';
import { Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';
import Sidebar from "./Sidebar";
import AddCardModal from "./AddCardModal"; 

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
          <AddCardModal onClose={() => setshowAddCardModal(false)} />
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
