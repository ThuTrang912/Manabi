import TopBar from "../components/TopBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddCardModal from "../components/AddCardModal";

export default function AddCardSetPage() {
  const [cardSetName, setCardSetName] = useState("");
  const [desc, setDesc] = useState("");
  const [rows, setRows] = useState([
    { term: "", definition: "", image: "" },
    { term: "", definition: "", image: "" },
  ]);
  // Modal thêm card
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [frontFields, setFrontFields] = useState([{ id: 1, label: "Mặt trước", value: "" }]);
  const [backFields, setBackFields] = useState([{ id: 2, label: "Mặt sau", value: "" }]);
  const navigate = useNavigate();

  const handleRowChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  // const addRow = () => {
  //   setRows([...rows, { term: "", definition: "", image: "" }]);
  // };
  // Thêm trường động cho modal
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
  // Thêm card vào danh sách
  const handleAddCard = () => {
    setRows([
      ...rows,
      {
        term: frontFields.map(f => f.value).join(" | "),
        definition: backFields.map(f => f.value).join(" | "),
        image: ""
      }
    ]);
    setShowAddCardModal(false);
    setFrontFields([{ id: 1, label: "Mặt trước", value: "" }]);
    setBackFields([{ id: 2, label: "Mặt sau", value: "" }]);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar navigate={navigate} />
      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold mb-2">Tạo một Bộ thẻ mới</h2>
        <div className="mb-4 text-gray-500 text-sm">Đã lưu chưa đầy 1 phút trước</div>
        <input
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Tên bộ thẻ..."
          value={cardSetName}
          onChange={e => setCardSetName(e.target.value)}
        />
        <textarea
          className="w-full mb-4 px-4 py-2 rounded border text-lg"
          placeholder="Thêm mô tả..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 transition">
            <span className="material-icons">input</span> Nhập
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 transition">
            <span className="material-icons">schema</span> Thêm sơ đồ
          </button>
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-200 transition">
            <span className="material-icons">note_add</span> Tạo từ ghi chú
          </button>
        </div>
        {/* {rows.map((row, idx) => (
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
        ))} */}
        <button
          className={`mt-2 px-6 py-2 rounded-full font-semibold transition ${cardSetName ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          onClick={() => cardSetName && setShowAddCardModal(true)}
          disabled={!cardSetName}
        >
          Thêm thẻ
        </button>
        {/* Modal thêm card giống TopBar */}
        {showAddCardModal && ( 
          <AddCardModal onClose={() => setShowAddCardModal(false)} currentCardSet={cardSetName}/> 
        )}
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Tạo</button>
          <button className="px-6 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">Tạo và ôn luyện</button>
        </div>
      </div>
    </div>
    );
  }