import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TagMenu from '../components/TagMenu';

export default function FolderPage() {
  // Tab state for add document modal
  const [addDocTab, setAddDocTab] = React.useState('recent');
  const { folderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const folderName = location.state?.folderName || folderId;

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
  // Modal for add document
  const [showAddSubfolderModal, setshowAddSubfolderModal] = React.useState(false);
  // Dummy handlers for menu actions
  const handleEdit = () => { setShowTagMenu(false); };
  const handleDelete = () => { setShowTagMenu(false); };
  const handleShare = () => { setShowTagMenu(false); };
  const handlePin = () => { setShowTagMenu(false); };
  const handleUnpin = () => { setShowTagMenu(false); };
  const handleAssignTag = () => { setShowTagMenu(false); };
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
          <div className="flex items-center justify-between w-full max-w-2xl mb-8">
            <h1 className="text-3xl font-bold">{folderName}</h1>
            <div className="flex gap-2 items-center">
              {/* Selected tag button */}
              <button className="px-4 py-1 rounded-full bg-gray-200 text-white font-semibold  border-none" style={{ minWidth: 80 }}>{selectedTag || "Học"}</button>
              {/* Three-dot button for tag management */}
              <div className="relative">
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 text-xl font-bold hover:bg-gray-200 transition" onClick={() => setShowTagMenu(v => !v)}>
                  <span className="material-icons" style={{fontSize: '1.5rem', color: 'gray'}}>more_horiz</span>
                </button>
                <TagMenu
                  show={showTagMenu}
                  onClose={() => setShowTagMenu(false)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onPin={handlePin}
                  onUnpin={handleUnpin}
                  onAssignTag={handleAssignTag}
                />
              </div>
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
        </main>
          {/* Modal thêm tài liệu học */}
          {showAddSubfolderModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-[480px] max-w-[95vw] flex flex-col relative" style={{maxHeight: '90vh', overflowY: 'auto'}}>
                {/* Close button */}
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setshowAddSubfolderModal(false)} aria-label="Đóng" style={{background: 'none', border: 'none', cursor: 'pointer'}}>×</button>
                <h2 className="text-2xl font-bold mb-4">Thêm vào test 4</h2>
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
                  {[
                    {name: 'test học phần', terms: 2},
                    {name: 'かきくけこ', terms: 522},
                    {name: 'あいうえお', terms: 322},
                    {name: 'Chuc nang cua code arduino', terms: 130},
                    {name: 'ばびぶべぼ', terms: 148},
                    {name: 'はひふへほ', terms: 369},
                    {name: 'らりるれろ', terms: 12},
                    {name: 'がぎぐげご', terms: 42},
                    {name: 'ばびぶべぼ', terms: 45},
                    {name: 'ざじずぜぞ', terms: 32},
                    {name: 'test học phần 2', terms: 5},
                    {name: 'かきくけこ 2', terms: 100},
                    {name: 'あいうえお 2', terms: 200},
                    {name: 'Chuc nang code 2', terms: 50},
                    {name: 'ばびぶべぼ 2', terms: 80},
                    {name: 'はひふへほ 2', terms: 150},
                    {name: 'らりるれろ 2', terms: 20},
                    {name: 'がぎぐげご 2', terms: 60},
                    {name: 'ばびぶべぼ 3', terms: 90},
                    {name: 'ざじずぜぞ 2', terms: 40}
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-blue-400 text-3xl">menu_book</span>
                        <div>
                          <div className="font-semibold text-base text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">Học phần ・ {item.terms} terms</div>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-blue-500 text-xl font-bold hover:bg-blue-100 transition">
                        <span className="material-icons">add</span>
                      </button>
                    </div>
                  ))}
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
