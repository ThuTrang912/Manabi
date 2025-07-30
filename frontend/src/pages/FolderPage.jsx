import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TagMenu from '../components/TagMenu';

export default function FolderPage() {
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
  // Dummy handlers for menu actions
  const handleEdit = () => { setShowTagMenu(false); };
  const handleDelete = () => { setShowTagMenu(false); };
  const handleShare = () => { setShowTagMenu(false); };
  const handlePin = () => { setShowTagMenu(false); };
  const handleUnpin = () => { setShowTagMenu(false); };
  const handleAssignTag = () => { setShowTagMenu(false); };
  // Toast auto-hide
  React.useEffect(() => {
    if (showTagInput) {
      const timer = setTimeout(() => setShowTagInput(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showTagInput]);

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
      <TopBar
        avatarUrl={avatarUrl}
        userName={userName}
        userEmail={userEmail}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menuRef={menuRef}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        navigate={navigate}
      />
      <div className="flex flex-1">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} navigate={navigate} />
        <main className="flex-1 flex flex-col items-center pt-12">
          <div className="flex items-center justify-between w-full max-w-2xl mb-8">
            <h1 className="text-3xl font-bold">{folderName}</h1>
            <div className="flex gap-2 items-center">
              {/* Selected tag button */}
              <button className="px-4 py-1 rounded-full bg-gray-200 text-white font-semibold shadow border-none" style={{ minWidth: 80 }}>{selectedTag || "Học"}</button>
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
            <button className={`px-4 py-1 rounded-full bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition${selectedTag === null ? '  bg-gray-200 shadow border-gray-400' : ''}`} onClick={() => setSelectedTag(null)}>Tất cả</button>
            {/* Other tags */}
            {tags.map((tag, idx) => (
              <button
                key={idx}
                className={`px-4 py-1 rounded-full bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition${selectedTag === tag ? ' bg-gray-200 shadow border-gray-400' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >{tag}</button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 text-xl font-bold hover:bg-gray-100 transition" onClick={() => setShowTagInput(true)}>+</button>
          </div>
          {/* Toast input for new tag */}
          {showTagInput && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3 border">
                <input
                  type="text"
                  className="px-3 py-2 rounded border focus:outline-none text-lg"
                  placeholder="Nhập tên thẻ (tối đa 10 ký tự)"
                  value={newTag}
                  maxLength={13}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                  autoFocus
                />
                <button className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600" onClick={handleAddTag}>Thêm</button>
                <button className="px-4 py-2 rounded bg-gray-100 text-gray-600 font-semibold" onClick={() => { setShowTagInput(false); setNewTag(""); }}>Hủy</button>
              </div>
            </div>
          )}
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow p-12 flex flex-col items-center">
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
              <button className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold text-lg shadow hover:bg-blue-600 transition">Thêm tài liệu học</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
