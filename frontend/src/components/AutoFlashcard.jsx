import React, { useState, useEffect, useRef } from 'react';

const AutoFlashcard = ({ cards, onHighlight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFront, setIsFront] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [frontLanguage, setFrontLanguage] = useState('ja-JP');
  const [backLanguage, setBackLanguage] = useState('vi-VN');
  const [isReading, setIsReading] = useState(false);
  const [autoDetectLang, setAutoDetectLang] = useState(true);
  const [frontLanguages, setFrontLanguages] = useState(['ja-JP', 'en-US']); // Multiple languages for front
  const [backLanguages, setBackLanguages] = useState(['vi-VN', 'en-US']); // Multiple languages for back
  const [autoScroll, setAutoScroll] = useState(true); // Auto scroll to current card
  
  const intervalRef = useRef(null);
  const cardRef = useRef(null);

  // Function to detect language from text within allowed languages
  const detectLanguage = (text, allowedLanguages = ['ja-JP', 'vi-VN', 'en-US', 'ko-KR', 'zh-CN']) => {
    if (!text || !text.trim()) return allowedLanguages[0] || 'en-US';
    
    const cleanText = text.trim();
    
    // Language detection patterns
    const patterns = {
      'ja-JP': /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
      'vi-VN': /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/,
      'ko-KR': /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/,
      'zh-CN': /[\u4E00-\u9FFF\u3400-\u4DBF]/,
      'en-US': /[a-zA-Z]/
    };
    
    // Count characters for each allowed language
    const counts = {};
    allowedLanguages.forEach(lang => {
      const pattern = patterns[lang];
      if (pattern) {
        counts[lang] = (cleanText.match(pattern) || []).length;
      } else {
        counts[lang] = 0;
      }
    });
    
    console.log('Language detection (limited scope):', {
      text: cleanText.substring(0, 50),
      allowedLanguages,
      counts
    });
    
    // Find the language with the highest count
    let maxCount = 0;
    let detectedLang = allowedLanguages[0];
    
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        detectedLang = lang;
      }
    }
    
    // If no special characters detected, use first allowed language
    if (maxCount === 0) {
      return allowedLanguages[0];
    }
    
    return detectedLang;
  };

  // Split text into language segments for mixed content (with allowed languages)
  const splitMixedLanguageText = (text, allowedLanguages) => {
    if (!text || !text.trim()) return [];
    
    const segments = [];
    const words = text.split(/(\s+|[。、，,\.!?;:])/);
    let currentSegment = '';
    let currentLang = null;
    
    words.forEach(word => {
      if (!word.trim()) {
        currentSegment += word;
        return;
      }
      
      const wordLang = detectLanguage(word, allowedLanguages);
      
      if (currentLang === null || currentLang === wordLang) {
        currentSegment += word;
        currentLang = wordLang;
      } else {
        // Language changed, save current segment and start new one
        if (currentSegment.trim()) {
          segments.push({
            text: currentSegment.trim(),
            lang: currentLang
          });
        }
        currentSegment = word;
        currentLang = wordLang;
      }
    });
    
    // Add the last segment
    if (currentSegment.trim()) {
      segments.push({
        text: currentSegment.trim(),
        lang: currentLang
      });
    }
    
    console.log('Text segments (limited):', segments);
    return segments;
  };

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
      // Always highlight the current card (for yellow background)
      if (onHighlight) {
        onHighlight(currentIndex, autoScroll); // Pass autoScroll flag to control scrolling
      }
      if (isPlaying) {
        showCard();
      }
    }
  }, [currentIndex, isFront, cards, autoScroll]);

  useEffect(() => {
    if (isPlaying && cards.length > 0) {
      showCard();
    } else if (!isPlaying) {
      // Stop speech when paused
      speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [isPlaying]);

  // Cleanup on component unmount - Stop speech when leaving AutoFlashcard
  useEffect(() => {
    return () => {
      console.log('AutoFlashcard unmounting - stopping all speech');
      speechSynthesis.cancel();
      setIsReading(false);
      // Clear any pending intervals or timeouts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const speak = (text, lang, isFrontSide = true) => {
    if (!('speechSynthesis' in window) || !text || !text.trim()) {
      // If no speech synthesis or no text, auto flip after short delay
      if (isPlaying) {
        setTimeout(() => autoFlip(), 1000);
      }
      return;
    }

    speechSynthesis.cancel(); // Cancel any ongoing speech
    setIsReading(true);
    
    if (autoDetectLang) {
      // Use allowed languages for current side
      const allowedLanguages = isFrontSide ? frontLanguages : backLanguages;
      const segments = splitMixedLanguageText(text, allowedLanguages);
      speakSegments(segments, 0);
    } else {
      // Use fixed language
      speakSingleText(text.trim(), lang, isFrontSide);
    }
  };

  const speakSegments = (segments, index) => {
    if (index >= segments.length) {
      // All segments completed
      console.log('All segments completed, auto flipping...');
      setIsReading(false);
      if (isPlaying) {
        setTimeout(() => {
          autoFlip();
        }, 500);
      }
      return;
    }

    const segment = segments[index];
    console.log(`Speaking segment ${index + 1}/${segments.length}:`, segment.text, 'in', segment.lang);
    
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = segment.lang;
    utterance.rate = speechRate;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      console.log(`Segment ${index + 1} completed`);
      // Small delay between segments
      setTimeout(() => {
        speakSegments(segments, index + 1);
      }, 200);
    };
    
    utterance.onerror = (error) => {
      console.error('Speech error on segment:', error);
      // Continue with next segment on error
      setTimeout(() => {
        speakSegments(segments, index + 1);
      }, 500);
    };
    
    speechSynthesis.speak(utterance);
  };

  const speakSingleText = (text, lang, isFrontSide = true) => {
    let finalLang = lang;
    
    // If auto-detect is on, still use detection but within allowed languages
    if (autoDetectLang) {
      const allowedLanguages = isFrontSide ? frontLanguages : backLanguages;
      finalLang = detectLanguage(text, allowedLanguages);
    }
    
    console.log('Speaking single text:', text, 'in', finalLang);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = finalLang;
    utterance.rate = speechRate;
    utterance.volume = 1.0;
    
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
    const defaultLanguage = isFront ? frontLanguage : backLanguage;
    
    console.log('Showing card:', {
      currentIndex, 
      isFront, 
      text: textToSpeak,
      autoDetect: autoDetectLang,
      defaultLang: defaultLanguage,
      allowedLanguages: isFront ? frontLanguages : backLanguages,
      autoScroll: autoScroll
    });
    
    speak(textToSpeak, defaultLanguage, isFront);
  };

  // Helper function to handle multi-language selection
  const handleLanguageToggle = (languageCode, isForFront) => {
    if (isForFront) {
      setFrontLanguages(prev => {
        if (prev.includes(languageCode)) {
          // Don't allow removing if it's the last language
          return prev.length > 1 ? prev.filter(lang => lang !== languageCode) : prev;
        } else {
          return [...prev, languageCode];
        }
      });
    } else {
      setBackLanguages(prev => {
        if (prev.includes(languageCode)) {
          return prev.length > 1 ? prev.filter(lang => lang !== languageCode) : prev;
        } else {
          return [...prev, languageCode];
        }
      });
    }
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
    const newIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(newIndex);
    setIsFront(true);
    // Always highlight, but scroll only if autoScroll is enabled
    if (onHighlight) {
      setTimeout(() => onHighlight(newIndex, autoScroll), 100);
    }
  };

  const prevCard = () => {
    const newIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(newIndex);
    setIsFront(true);
    // Always highlight, but scroll only if autoScroll is enabled
    if (onHighlight) {
      setTimeout(() => onHighlight(newIndex, autoScroll), 100);
    }
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
            
            {!autoScroll && (
              <button
                onClick={() => {
                  if (onHighlight) {
                    console.log('Manual scroll to current card:', currentIndex);
                    onHighlight(currentIndex, true); // Force scroll = true for manual scroll
                  }
                }}
                className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                title="Cuộn đến thẻ hiện tại (highlight vẫn đang hiện)"
              >
                📍 Cuộn
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Auto-detect and Speed */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="text-gray-600">
                <input
                  type="checkbox"
                  checked={autoDetectLang}
                  onChange={(e) => setAutoDetectLang(e.target.checked)}
                  className="mr-1"
                />
                Tự nhận diện ngôn ngữ
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-600">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="mr-1"
                />
                Tự động cuộn (highlight vẫn hiện)
              </label>
            </div>
            
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
          </div>

          {/* Language Settings */}
          {autoDetectLang ? (
            // Multi-language selection for auto-detect mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Front Side Languages */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-gray-700 mb-2">Ngôn ngữ mặt trước:</h4>
                <div className="space-y-1">
                  {languageOptions.map(option => (
                    <label key={`front-${option.code}`} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={frontLanguages.includes(option.code)}
                        onChange={() => handleLanguageToggle(option.code, true)}
                        className="mr-2"
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Back Side Languages */}
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-gray-700 mb-2">Ngôn ngữ mặt sau:</h4>
                <div className="space-y-1">
                  {languageOptions.map(option => (
                    <label key={`back-${option.code}`} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={backLanguages.includes(option.code)}
                        onChange={() => handleLanguageToggle(option.code, false)}
                        className="mr-2"
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Single language selection for fixed mode
            <div className="flex flex-wrap justify-center gap-4 text-sm">
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
          )}
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
          className="w-96 h-64 border-2 border-gray-300 rounded-xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 shadow-lg flex flex-col overflow-hidden"
          style={{ userSelect: 'none' }}
        >
          {/* Header */}
          <div className="px-4 py-2 flex-shrink-0 border-b border-gray-200/50 bg-white/70">
            <div className="text-xs text-gray-500 text-center">
              {isFront ? 'Mặt trước' : 'Mặt sau'}
            </div>
          </div>
          
          {/* Content with scroll */}
          <div className="flex-1 p-4 overflow-y-auto flashcard-content">
            <div className="h-full flex items-center justify-center">
              <div 
                className="text-lg font-medium text-center flashcard-text w-full"
                style={{ 
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: isFront ? frontText : backText 
                }}
              />
            </div>
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
