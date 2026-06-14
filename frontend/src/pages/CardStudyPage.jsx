import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

export default function CardStudyPage() {
  const { cardsetId } = useParams();
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);

  // Dummy card data
  const cards = [
    { term: "yesterday", definition: "hôm qua" },
    { term: "today", definition: "hôm nay" },
    { term: "tomorrow", definition: "ngày mai" },
    { term: "morning", definition: "buổi sáng" },
    { term: "afternoon", definition: "buổi chiều" },
    { term: "evening", definition: "buổi tối" },
    { term: "night", definition: "ban đêm" },
    { term: "week", definition: "tuần" },
    { term: "month", definition: "tháng" },
    { term: "year", definition: "năm" },
    { term: "time", definition: "thời gian" },
    { term: "hour", definition: "giờ" },
    { term: "minute", definition: "phút" },
    { term: "second", definition: "giây" },
    { term: "always", definition: "luôn luôn" }
  ];

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="material-icons">folder</span>
              <span>3000 từ tiếng anh thông dụng</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Từ vựng tiếng anh p30(. 3000 từ thông dụng nhất) IELTS
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-yellow-500">⭐ Cho điểm đánh giá đầu tiên</span>
            </div>
          </div>

          {/* Study modes */}
          <div className="flex gap-4 mb-8">
            <button className="bg-blue-100 text-blue-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span className="material-icons">credit_card</span>
              Thẻ ghi nhớ
            </button>
            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span className="material-icons">refresh</span>
              Học
            </button>
            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span className="material-icons">speed</span>
              Blast
            </button>
            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span className="material-icons">quiz</span>
              Kiểm tra
            </button>
            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
              <span className="material-icons">view_module</span>
              Ghép thẻ
            </button>
          </div>

          {/* Card display */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div 
                className="w-96 h-64 bg-white rounded-xl shadow-lg border cursor-pointer flex items-center justify-center text-center p-8 transition-transform hover:scale-105"
                onClick={toggleAnswer}
              >
                <div>
                  <div className="text-2xl font-bold mb-4">
                    {showAnswer ? cards[currentCard].definition : cards[currentCard].term}
                  </div>
                  <div className="text-sm text-gray-500">
                    {showAnswer ? "Định nghĩa" : "Thuật ngữ"}
                  </div>
                </div>
              </div>
              {/* Audio button */}
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-gray-600">volume_up</span>
              </button>
              {/* Star button */}
              <button className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-gray-400">star_border</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button 
              className="w-12 h-12 bg-white rounded-full shadow border flex items-center justify-center disabled:opacity-50"
              onClick={prevCard}
              disabled={currentCard === 0}
            >
              <span className="material-icons">arrow_back</span>
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold">{currentCard + 1} / {cards.length}</div>
              <div className="text-sm text-gray-500">Hiển thị gợi ý</div>
            </div>

            <button 
              className="w-12 h-12 bg-white rounded-full shadow border flex items-center justify-center disabled:opacity-50"
              onClick={nextCard}
              disabled={currentCard === cards.length - 1}
            >
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>

          {/* Settings */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-lg shadow border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Theo dõi tiến độ</span>
              </label>
              <button className="text-gray-600">
                <span className="material-icons">settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
