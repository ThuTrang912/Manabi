// import React from "react";

// export default function AddMenu({ navigate }) {
//   // All menu-related state and handlers are now managed here
//   // Remove showAdd and button logic, only render menu content
//   const [showTagToast, setShowTagToast] = React.useState(false);
//   const [showFolderModal, setShowFolderModal] = React.useState(false);
//   const [folderName, setFolderName] = React.useState("");
//   const defaultFields = [
//     { id: 1, label: "Mặt trước", value: "" },
//     { id: 2, label: "Mặt sau", value: "" },
//     { id: 3, label: "Thêm Thẻ ngược", value: "" },
//     { id: 4, label: "Nhãn", value: "" },
//   ];
//   const [fields, setFields] = React.useState(defaultFields);
//   // Danh sách thẻ đã nhập
//   const [addedCards, setAddedCards] = React.useState([]);
//   // Thêm trường mới
//   const addField = () => {
//     const nextId = fields.length ? Math.max(...fields.map(f => f.id)) + 1 : 1;
//     setFields([...fields, { id: nextId, label: `Trường ${nextId}`, value: "" }]);
//   };
//   // Xóa trường
//   const removeField = (id) => {
//     setFields(fields.filter(f => f.id !== id));
//   };
//   // Đổi giá trị trường
//   const updateField = (id, value) => {
//     setFields(fields.map(f => f.id === id ? { ...f, value } : f));
//   };
//   // Thêm thẻ vào danh sách
//   const handleAddCard = () => {
//     // Lưu thẻ hiện tại vào mảng
//     setAddedCards([...addedCards, fields.map(f => ({ label: f.label, value: f.value }))]);
//     // Reset các trường về rỗng
//     setFields(fields.map(f => ({ ...f, value: "" })));
//   };

//   return (
//     <div>
//       <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg border z-50 py-2 transition-all duration-200 ease-out" style={{transform: 'translateY(-10px)', opacity: 1, pointerEvents: 'auto'}}>
//         <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {
//           e.stopPropagation();
//           setShowAdd(false);
//           setShowTagToast(true);
//         }}>
//           <span className="material-icons">style</span> Thẻ
//         </button>
//         <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false); navigate(`/add-row`);}}>
//           <span className="material-icons">library_books</span> Học phần
//         </button>
//         <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left" onClick={e => {e.stopPropagation(); setShowAdd(false); setShowFolderModal(true);}}>
//           <span className="material-icons">folder</span> Thư mục
//         </button>
//       </div>
//       {/* Toast cho nút Thẻ */}
//       {showTagToast && (
//         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
//           <div className="bg-white rounded-xl shadow-lg px-6 py-6 flex flex-col gap-4 border min-w-[600px] max-w-[90vw]" style={{maxHeight: '80vh', overflowY: 'auto'}}>
//             {/* Hiển thị số thẻ đã thêm */}
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-gray-500">Đã thêm <b>{addedCards.length}</b> thẻ</span>
//               {addedCards.length > 0 && (
//                 <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs" onClick={() => { setShowTagToast(false); setAddedCards([]); }}>
//                   Đóng & Xem danh sách thẻ
//                 </button>
//               )}
//             </div>
//             {/* Thanh chức năng phía trên */}
//             <div className="flex items-center gap-4 mb-2 flex-wrap">
//               {/* Hàng 1: input Kiểu và Bộ thẻ */}
//               <div className="flex w-full gap-4 mb-2">
//                 <div className="flex flex-col" style={{flex: 4}}>
//                   <label className="text-xs text-gray-500 mb-1">Kiểu</label>
//                   <input className="px-2 py-1 rounded border text-sm w-full min-w-0" defaultValue="Cơ bản (thẻ ngược tuỳ chọn)" />
//                 </div>
//                 <div className="flex flex-col" style={{flex: 6}}>
//                   <label className="text-xs text-gray-500 mb-1">Bộ thẻ</label>
//                   <input className="px-2 py-1 rounded border text-sm w-full min-w-0" defaultValue="Japanese Core 2000 Step 01 Listening Sentence Vocab + Images" />
//                 </div>
//               </div>
//               {/* Hàng 2: các nút chức năng */}
//               <div className="flex gap-2 flex-wrap w-full">
//                 <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"><span className="material-icons">info</span>Trường tin...</button>
//                 <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 text-sm"><span className="material-icons">style</span>Thẻ...</button>
//               </div>
//             </div>
//             {/* Thanh nút chức năng định dạng */}
//             <div className="flex items-center gap-2 mb-2 flex-wrap">
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Đậm"><b>B</b></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Nghiêng"><i>I</i></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Gạch dưới"><u>U</u></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Gạch ngang"><span style={{textDecoration: 'line-through'}}>S</span></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Cỡ chữ nhỏ">x<sub>2</sub></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Cỡ chữ lớn">A</button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Màu sắc"><span className="material-icons">format_color_fill</span></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn hình"><span className="material-icons">image</span></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn âm thanh"><span className="material-icons">mic</span></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn file"><span className="material-icons">attach_file</span></button>
//               <button className="px-2 py-1 rounded bg-gray-100 text-gray-700" title="Chèn công thức"><span className="material-icons">functions</span></button>
//             </div>
//             {/* Các trường nhập động */}
//             <div className="flex flex-col gap-2 mb-2">
//               {fields.map((field, idx) => (
//                 <div key={field.id} className="flex items-center gap-2">
//                   <input
//                     className="w-full px-4 py-2 rounded border text-lg"
//                     placeholder={field.label}
//                     value={field.value}
//                     onChange={e => updateField(field.id, e.target.value)}
//                   />
//                   {fields.length > 1 && (
//                     <button className="px-2 py-1 rounded bg-red-100 text-red-600 text-xs" title="Xóa trường" onClick={() => removeField(field.id)}>
//                       <span className="material-icons">close</span>
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button className="px-3 py-1 rounded bg-green-100 text-green-700 font-semibold mt-2 w-fit" onClick={addField}>
//                 + Thêm trường
//               </button>
//             </div>
//             <div className="flex justify-end gap-4 mt-2">
//               <button className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => setShowTagToast(false)}>Đóng</button>
//               <button className="px-6 py-2 rounded bg-blue-500 text-white font-semibold" onClick={handleAddCard}>Thêm</button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Modal tạo thư mục */}
//       {showFolderModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//           <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] flex flex-col items-center relative">
//             <span className="material-icons text-5xl text-gray-500 mb-4">folder</span>
//             <input
//               type="text"
//               className="w-full text-center text-lg font-semibold mb-6 px-4 py-2 bg-gray-100 rounded focus:outline-none"
//               placeholder="Đặt tên cho thư mục của bạn"
//               value={folderName}
//               onChange={e => setFolderName(e.target.value)}
//             />
//             <div className="flex gap-4 mt-2">
//               <button className="px-6 py-2 rounded bg-gray-100 text-gray-600 font-semibold" onClick={() => { setShowFolderModal(false); setFolderName(""); }}>Hủy</button>
//               <button
//                 className={`px-6 py-2 rounded font-semibold ${folderName ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
//                 disabled={!folderName}
//                 onClick={() => {
//                   // Tạo folder object với id và tên, chuyển hướng sang màn hình folder
//                   const folderId = Date.now().toString(); // Tạo id đơn giản
//                   setShowFolderModal(false);
//                   setFolderName("");
//                   navigate(`/folder/${folderId}`, { state: { folderName } });
//                 }}
//               >Tạo</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
