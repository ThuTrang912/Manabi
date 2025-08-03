
import React from "react";
import TopBar from "../components/TopBar";

export default function LibraryPage({ navigate }) {
  // Dummy data for demonstration
  const progressSets = [
    { terms: 15, name: "(Bản nháp) Từ vựng tiếng anh p30(. 3000 từ thông dụng nhất) IELTS" },
    { terms: 842, name: "(Bản nháp) かきくけこ" },
    { terms: 323, name: "(Bản nháp) あいうえお" },
    { terms: 112, name: "(Bản nháp) だでど" },
    { terms: 349, name: "(Bản nháp) かきくけこ" },
    { terms: 441, name: "(Bản nháp) あいうえお" },
    { terms: 187, name: "(Bản nháp) かきくけこ" },
  ];
  const weekSets = [
    { terms: 4, user: "thu_trang912", name: "test học phần" }
  ];
  return (
    <>
      <TopBar navigate={navigate} />
      <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Thư viện của bạn</h1>
      <div className="flex gap-6 mb-4 border-b pb-2">
        <button className="font-semibold border-b-2 border-blue-500 text-blue-600 px-2 pb-1">Học phần</button>
        <button className="text-gray-500 px-2 pb-1">Bài kiểm tra thử</button>
        <button className="text-gray-500 px-2 pb-1">Lời giải chuyên gia</button>
        <button className="text-gray-500 px-2 pb-1">Thư mục</button>
        <button className="text-gray-500 px-2 pb-1">Lớp học</button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button className="bg-gray-100 px-4 py-2 rounded text-gray-700">Gần đây</button>
        <input className="border rounded px-3 py-2 w-72" placeholder="Tìm kiếm thẻ ghi nhớ" />
      </div>
      <div className="mb-8">
        <div className="font-bold text-gray-600 mb-2">TIẾN TRÌNH</div>
        <div className="flex flex-col gap-2">
          {progressSets.map((set, idx) => (
            <div key={idx} className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold">
              <span className="text-xs text-gray-500 font-normal">{set.terms} thuật ngữ</span> <span className="ml-2">{set.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <div className="font-bold text-gray-600 mb-2">TUẦN NÀY</div>
        <div className="flex flex-col gap-2">
          {weekSets.map((set, idx) => (
            <div key={idx} className="bg-white rounded-lg px-4 py-3 shadow border text-base font-semibold flex items-center gap-2">
              <span className="text-xs text-gray-500 font-normal">{set.terms} thuật ngữ</span>
              <span className="text-xs text-gray-400 font-normal">by {set.user}</span>
              <span className="ml-2">{set.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="font-bold text-gray-600 mb-2">THÁNG 7 NĂM 2025</div>
        {/* Thêm dữ liệu tháng nếu cần */}
      </div>
      </div>
    </>
  );
}
