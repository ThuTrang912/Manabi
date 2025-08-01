import TopBar from "../components/TopBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCardSetPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [rows, setRows] = useState([
    { term: "", definition: "", image: "" },
    { term: "", definition: "", image: "" },
  ]);
  const navigate = useNavigate();

  const handleRowChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { term: "", definition: "", image: "" }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar navigate={navigate} />
      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold mb-2">Tạo một Bộ thẻ mới</h2>
        <div className="mb-4 text-gray-500 text-sm">Đã lưu chưa đầy 1 phút trước</div>
        <input
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Tiêu đề"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Thêm mô tả..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2">
            <span className="material-icons">input</span> Nhập
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2">
            <span className="material-icons">schema</span> Thêm sơ đồ
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2">
            <span className="material-icons">note_add</span> Tạo từ ghi chú
          </button>
        </div>
        {rows.map((row, idx) => (
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
        ))}
        <button
          className="mt-2 px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold"
          onClick={addRow}
        >
          Thêm thẻ
        </button>
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold">Tạo</button>
          <button className="px-6 py-2 rounded bg-blue-500 text-white font-semibold">Tạo và ôn luyện</button>
        </div>
      </div>
    </div>
    );
  }