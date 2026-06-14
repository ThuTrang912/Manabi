import React from "react";

export default function TagMenu({ show, onClose, onEdit, onCopy, onPrint, onPin, onExport, onEmbed, onDelete }) {
  if (!show) return null;
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50 py-2 flex flex-col" style={{ top: '100%' }}>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onEdit}>
        <span className="material-icons text-base">edit</span> Sửa
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onCopy}>
        <span className="material-icons text-base">content_copy</span> Tao một bản sao
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onPrint}>
        <span className="material-icons text-base">print</span> In
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onPin}>
        <span className="material-icons text-base">person_add</span> Ghép
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onExport}>
        <span className="material-icons text-base">share</span> Chia sẻ
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onEmbed}>
        <span className="material-icons text-base">code</span> Nhúng
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-gray-100 text-left" onClick={onDelete}>
        <span className="material-icons text-base text-red-500">delete</span> Xóa
      </button>
    </div>
  );
}
