import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TagMenu from '../components/TagMenu';
import ItemMenu from '../components/ItemMenu';

export default function FolderPage() {
  // Tab state for add document modal
  const [addDocTab, setAddDocTab] = React.useState('recent');
  const { folderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Folder state
  const [folder, setFolder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [cardSets, setCardSets] = React.useState([]); // Real cardset data
  const folderName = folder?.name || "Đang tải...";

  // Fetch folder details from API
  React.useEffect(() => {
    const fetchFolder = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`http://localhost:5001/api/folders/${folderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const folderData = await response.json();
          setFolder(folderData);
        } else {
          console.error("Failed to fetch folder:", response.status);
        }
      } catch (error) {
        console.error("Error fetching folder:", error);
      } finally {
        setLoading(false);
      }
    };

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
        } else {
          console.error("Failed to fetch card sets:", response.status);
        }
      } catch (error) {
        console.error("Error fetching card sets:", error);
      }
    };

    if (folderId) {
      fetchFolder();
    }
    fetchCardSets();
  }, [folderId]);

  // Dummy user info (replace with real logic if needed)
  const avatarUrl = "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=96";
  const userName = "User";
  const userEmail = "user@example.com";
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef();
  const [showSidebar, setShowSidebar] = React.useState(false);

  // Tag state
  const [tags, setTags] = React.useState([]);
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState(null); // Track selected tag
  const [showTagMenu, setShowTagMenu] = React.useState(false);
  const [showItemMenu, setShowItemMenu] = React.useState({}); // Track which item menu is open
  // Modal for add document
  const [showAddSubfolderModal, setshowAddSubfolderModal] = React.useState(false);
  // Dummy handlers for menu actions
  const handleEdit = () => { setShowTagMenu(false); };
  const handleCopy = () => { setShowTagMenu(false); };
  const handlePrint = () => { setShowTagMenu(false); };
  const handlePin = () => { setShowTagMenu(false); };
  const handleExport = () => { setShowTagMenu(false); };
  const handleEmbed = () => { setShowTagMenu(false); };
  const handleDelete = () => { setShowTagMenu(false); };
  
  // Handlers for item menu actions
  const handleItemEdit = (item, itemIndex) => {
    setShowItemMenu({});
    // Navigate to edit cardset page with real cardset ID
    navigate(`/edit-cardset/${item._id}`);
  };
  const handleItemCopy = (item, itemIndex) => { 
    setShowItemMenu({});
    // TODO: Implement copy functionality 
  };
  const handleItemDelete = (item, itemIndex) => { 
    setShowItemMenu({});
    // TODO: Implement delete functionality
  };
  // Toast auto-hide
  // React.useEffect(() => {
  //   if (showTagInput) {
  //     const timer = setTimeout(() => setShowTagInput(false), 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showTagInput]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    let tagText = newTag.trim();
    if (tagText.length > 10) tagText = tagText.slice(0, 10) + '...';
    setTags([...tags, tagText]);
    setNewTag("");
    setShowTagInput(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar navigate={navigate} />
      <div className="flex flex-1">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} navigate={navigate} />
        <main className="flex-1 flex flex-col items-center pt-12">
          {loading ? (
            <div className="text-gray-500">Đang tải thông tin thư mục...</div>
          ) : (
            <>
              <div className="flex items-center justify-between w-full max-w-2xl mb-8">
                <h1 className="text-3xl font-bold">{folderName}</h1>
                <div className="relative">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 text-xl font-bold hover:bg-gray-200 transition" onClick={() => setShowTagMenu(v => !v)}>
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
          {/* Tag bar */}
          <div className="flex gap-2 mb-4 items-center">
            {/* All tag button */}
            <button className={`px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition${selectedTag === null ? ' bg-gray-300 border-gray-400' : ''}`} onClick={() => setSelectedTag(null)}>Tất cả</button>
            {/* Other tags */}
            {tags.map((tag, idx) => (
              <button
                key={idx}
                className={`px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition${selectedTag === tag ? ' bg-gray-300 border-gray-400' : ' '}`}
                onClick={() => setSelectedTag(tag)}
              >{tag}</button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 text-xl font-bold hover:bg-gray-200 transition" onClick={() => setShowTagInput(true)}>
              <span className="material-icons" style={{ fontSize: '1.2rem', color: 'gray' }}>add</span>
            </button>
          </div>
          {/* Modal input cho tag mới */}
          {showTagInput && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl -lg px-8 py-6 flex flex-col items-center gap-4 border w-[400px] relative">
                {/* Close button (X) */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                  onClick={() => { setShowTagInput(false); setNewTag(""); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Đóng"
                >×</button>
                <h2 className="text-xl font-bold mb-2">Thẻ mới</h2>
                <input
                  type="text"
                  className="px-3 py-2 rounded border focus:outline-none text-lg w-full"
                  placeholder="Tên thẻ"
                  value={newTag}
                  maxLength={13}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                  autoFocus
                />
                <div className="w-full text-left text-sm text-gray-500 mb-2">Được đề xuất</div>
                <div className="flex flex-wrap gap-2 w-full mb-2">
                  {['Bài thi 1', 'Bài thi 2', 'Giữa kỳ', 'Bài thi cuối kỳ', 'Quiz 1', 'Đơn vị 1'].map(sug => (
                    <button
                      key={sug}
                      className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold  border-none hover:bg-gray-200 transition"
                      type="button"
                      onClick={() => setNewTag(sug)}
                    >{sug}</button>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 w-full">
                  <div className="flex gap-4 justify-center w-full">
                    <button className="w-32 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold" onClick={() => { setShowTagInput(false); setNewTag(""); }}>Hủy</button>
                    <button
                      className={`w-32 px-4 py-2 rounded font-semibold ${newTag.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      disabled={!newTag.trim()}
                      onClick={handleAddTag}
                    >Thêm</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gray-100 rounded-2xl  p-12 flex flex-col items-center">
              {/* Icon group */}
              <div className="flex gap-4 mb-6">
                <span className="material-icons text-6xl text-blue-400">menu_book</span>
                <span className="material-icons text-6xl text-pink-400">description</span>
                <span className="material-icons text-6xl text-orange-400">assignment</span>
              </div>
              {selectedTag === null ? (
                <div className="mb-6 text-lg font-medium text-gray-700 text-center">Bắt đầu xây dựng thư mục của bạn</div>
              ) : (
                <div className="mb-6 text-lg font-medium text-gray-700 text-center">Thêm tài liệu cho thẻ <b>{selectedTag}</b></div>
              )}
              <button className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition" onClick={() => setshowAddSubfolderModal(true)}>Thêm tài liệu học</button>
            </div>
          </div>
            </>
          )}
        </main>
          {/* Modal thêm tài liệu học */}
          {showAddSubfolderModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-[480px] max-w-[95vw] flex flex-col relative" style={{maxHeight: '90vh', overflowY: 'auto'}}>
                {/* Close button */}
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setshowAddSubfolderModal(false)} aria-label="Đóng" style={{background: 'none', border: 'none', cursor: 'pointer'}}>×</button>
                <h2 className="text-2xl font-bold mb-4">Thêm vào {folderName}</h2>
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-4 py-1 rounded-full font-semibold hover:bg-gray-200 transition${addDocTab === 'recent' ? ' bg-gray-300 border-gray-400 text-gray-700' : ' bg-gray-100 text-gray-700'}`}
                    onClick={() => setAddDocTab('recent')}
                  >Gần đây</button>
                  <button
                    className={`px-4 py-1 rounded-full font-semibold hover:bg-gray-200 transition${addDocTab === 'library' ? ' bg-gray-300 border-gray-400 text-gray-700' : ' bg-gray-100 text-gray-700'}`}
                    onClick={() => setAddDocTab('library')}
                  >Thư viện của bạn</button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Học phần</div>
                  <button className="text-blue-500 font-semibold text-sm flex items-center gap-1"><span className="material-icons text-base">add</span> Tạo mới</button>
                </div>
                {/* List of items */}
                <div className="flex flex-col gap-2 mb-4" style={{maxHeight: '680px', overflowY: 'auto'}}>
                  {cardSets.length > 0 ? cardSets.map((item, idx) => (
                    <div key={item._id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-blue-400 text-3xl">menu_book</span>
                        <div>
                          <div className="font-semibold text-base text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            Học phần ・ {item.stats?.totalCards || 0} thẻ
                            {item.source && item.source !== "manual" && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                                {item.source === "quizlet" ? "Quizlet" : 
                                 item.source === "anki" ? "Anki" : 
                                 item.source.charAt(0).toUpperCase() + item.source.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-blue-500 text-xl font-bold hover:bg-blue-100 transition">
                          <span className="material-icons">add</span>
                        </button>
                        <div className="relative">
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-200 transition"
                            onClick={() => setShowItemMenu(prev => ({...prev, [idx]: !prev[idx]}))}
                          >
                            <span className="material-icons" style={{fontSize: '1rem', color: 'gray'}}>more_vert</span>
                          </button>
                          <ItemMenu
                            show={showItemMenu[idx]}
                            onClose={() => setShowItemMenu(prev => ({...prev, [idx]: false}))}
                            onEdit={() => handleItemEdit(item, idx)}
                            onCopy={() => handleItemCopy(item, idx)}
                            onDelete={() => handleItemDelete(item, idx)}
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    // Fallback to dummy data if no real data
                    [
                      {name: 'test học phần', terms: 2, id: 'test-1', _id: 'dummy-1'},
                      {name: 'かきくけこ', terms: 522, id: 'kakikukeko', _id: 'dummy-2'},
                      {name: 'あいうえお', terms: 322, id: 'aiueo', _id: 'dummy-3'},
                    ].map((item, idx) => (
                      <div key={item._id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="material-icons text-blue-400 text-3xl">menu_book</span>
                          <div>
                            <div className="font-semibold text-base text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500">Học phần ・ {item.terms} terms</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-blue-500 text-xl font-bold hover:bg-blue-100 transition">
                            <span className="material-icons">add</span>
                          </button>
                          <div className="relative">
                            <button 
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-200 transition"
                              onClick={() => setShowItemMenu(prev => ({...prev, [idx]: !prev[idx]}))}
                            >
                              <span className="material-icons" style={{fontSize: '1rem', color: 'gray'}}>more_vert</span>
                            </button>
                            <ItemMenu
                              show={showItemMenu[idx]}
                              onClose={() => setShowItemMenu(prev => ({...prev, [idx]: false}))}
                              onEdit={() => handleItemEdit(item, idx)}
                              onCopy={() => handleItemCopy(item, idx)}
                              onDelete={() => handleItemDelete(item, idx)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="px-6 py-2 rounded bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition" style={{minWidth: '100px'}} onClick={() => setshowAddSubfolderModal(false)}>Hoàn tất</button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
