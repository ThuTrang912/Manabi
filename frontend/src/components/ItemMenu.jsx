import React from "react";

export default function ItemMenu({ show, onClose, onEdit, onCopy, onDelete }) {
  if (!show) return null;
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 py-2 flex flex-col" style={{ top: '100%' }}>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onEdit}>
        <span className="material-icons text-base">edit</span> Sửa
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={onCopy}>
        <span className="material-icons text-base">content_copy</span> Sao chép
      </button>
      <button className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-gray-100 text-left" onClick={onDelete}>
        <span className="material-icons text-base text-red-500">delete</span> Xóa
      </button>
    </div>
  );
}
