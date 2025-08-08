import React, { useState, useEffect, useRef } from 'react';

const AutoFlashcard = ({ cards, onHighlight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFront, setIsFront] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [frontLanguage, setFrontLanguage] = useState('ja-JP');
  const [backLanguage, setBackLanguage] = useState('vi-VN');
  const [isReading, setIsReading] = useState(false);
  
  const intervalRef = useRef(null);
  const cardRef = useRef(null);

  // Language options
  const languageOptions = [
    { code: 'ja-JP', name: 'Tiếng Nhật' },
    { code: 'vi-VN', name: 'Tiếng Việt' },
    { code: 'en-US', name: 'Tiếng Anh' },
    { code: 'ko-KR', name: 'Tiếng Hàn' },
    { code: 'zh-CN', name: 'Tiếng Trung' },
    { code: 'fr-FR', name: 'Tiếng Pháp' },
    { code: 'de-DE', name: 'Tiếng Đức' },
    { code: 'es-ES', name: 'Tiếng Tây Ban Nha' }
  ];

  // Speech rate options
  const speechRateOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' }
  ];

  useEffect(() => {
    if (cards.length > 0) {
      if (onHighlight) {
        onHighlight(currentIndex);
      }
      if (isPlaying) {
        showCard();
      }
    }
  }, [currentIndex, isFront, cards]);

  useEffect(() => {
    if (isPlaying && cards.length > 0) {
      showCard();
    } else if (!isPlaying) {
      // Stop speech when paused
      speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [isPlaying]);

  const speak = (text, lang) => {
    if (!('speechSynthesis' in window) || !text || !text.trim()) {
      // If no speech synthesis or no text, auto flip after short delay
      if (isPlaying) {
        setTimeout(() => autoFlip(), 1000);
      }
      return;
    }

    speechSynthesis.cancel(); // Cancel any ongoing speech
    setIsReading(true);
    
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang;
    utterance.rate = speechRate;
    utterance.volume = 1.0;
    
    console.log('Speaking:', text, 'in', lang, 'at rate', speechRate);
    
    // When speech ends, auto flip to next side/card
    utterance.onend = () => {
      console.log('Speech completed, auto flipping...');
      setIsReading(false);
      if (isPlaying) {
        setTimeout(() => {
          autoFlip();
        }, 500); // Small delay after speech ends
      }
    };
    
    utterance.onerror = (error) => {
      console.error('Speech error:', error);
      setIsReading(false);
      if (isPlaying) {
        setTimeout(() => {
          autoFlip();
        }, 1000);
      }
    };
    
    speechSynthesis.speak(utterance);
  };

  const showCard = () => {
    if (cards.length === 0 || !isPlaying) return;
    
    const currentCard = cards[currentIndex];
    let frontText, backText;
    
    // Handle different card data formats
    if (currentCard.content) {
      // New format with content object
      frontText = currentCard.content.front?.text || '';
      backText = currentCard.content.back?.text || '';
    } else {
      // Legacy format with term/definition
      frontText = currentCard.term || '';
      backText = currentCard.definition || '';
    }
    
    const textToSpeak = isFront ? frontText : backText;
    const language = isFront ? frontLanguage : backLanguage;
    
    console.log('Showing card:', {currentIndex, isFront, text: textToSpeak});
    speak(textToSpeak, language);
  };

  const autoFlip = () => {
    console.log('Auto flipping from', isFront ? 'front' : 'back');
    setIsFront(prev => {
      const newIsFront = !prev;
      if (newIsFront) {
        // Moving to next card
        setCurrentIndex(prevIndex => (prevIndex + 1) % cards.length);
      }
      return newIsFront;
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
    setIsPlaying(prev => !prev);
  };

  const nextCard = () => {
    setCurrentIndex((currentIndex + 1) % cards.length);
    setIsFront(true);
  };

  const prevCard = () => {
    setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
    setIsFront(true);
  };

  const flipCard = () => {
    setIsFront(prev => !prev);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Không có thẻ nào để hiển thị
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  let frontText, backText;
  
  // Handle different card data formats
  if (currentCard.content) {
    // New format with content object
    frontText = currentCard.content.front?.text || 'Không có nội dung';
    backText = currentCard.content.back?.text || 'Không có nội dung';
  } else {
    // Legacy format with term/definition
    frontText = currentCard.term || 'Không có nội dung';
    backText = currentCard.definition || 'Không có nội dung';
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-4">
          Flashcard Tự Động
          {isReading && (
            <span className="ml-2 text-blue-600 text-sm">
              🎵 Đang đọc...
            </span>
          )}
        </h3>
        
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className={`px-4 py-2 rounded-lg font-medium ${
                isPlaying 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPlaying ? '⏸️ Tạm dừng' : '▶️ Phát'}
            </button>
            
            <button
              onClick={prevCard}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ⏮️
            </button>
            
            <button
              onClick={flipCard}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              🔄 Lật thẻ
            </button>
            
            <button
              onClick={nextCard}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ⏭️
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">          
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Tốc độ đọc:</label>
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="px-2 py-1 rounded border"
            >
              {speechRateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Ngôn ngữ trước:</label>
            <select
              value={frontLanguage}
              onChange={(e) => setFrontLanguage(e.target.value)}
              className="px-2 py-1 rounded border"
            >
              {languageOptions.map(option => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Ngôn ngữ sau:</label>
            <select
              value={backLanguage}
              onChange={(e) => setBackLanguage(e.target.value)}
              className="px-2 py-1 rounded border"
            >
              {languageOptions.map(option => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Thẻ {currentIndex + 1} / {cards.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          onClick={flipCard}
          className="w-80 h-48 border-2 border-gray-300 rounded-xl flex items-center justify-center cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 shadow-lg"
          style={{ userSelect: 'none' }}
        >
          <div className="text-center px-4">
            <div className="text-xs text-gray-500 mb-2">
              {isFront ? 'Mặt trước' : 'Mặt sau'}
            </div>
            <div 
              className="text-lg font-medium"
              dangerouslySetInnerHTML={{ 
                __html: isFront ? frontText : backText 
              }}
            />
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-4">
        Nhấp vào thẻ để lật thẻ
      </div>
    </div>
  );
};

export default AutoFlashcard;
