import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    // Liên kết với CardSet
    cardSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CardSet",
      required: true,
    },

    // Vị trí trong bộ thẻ
    position: {
      type: Number,
      default: 0,
    },

    // Nội dung thẻ - hỗ trợ nhiều định dạng
    content: {
      // Mặt trước
      front: {
        text: {
          type: String,
          required: true,
        },
        image: {
          type: String, // URL hoặc path
          default: "",
        },
        audio: {
          type: String, // URL hoặc path
          default: "",
        },
        // Hỗ trợ HTML/Markdown cho định dạng phức tạp
        html: {
          type: String,
          default: "",
        },
      },

      // Mặt sau
      back: {
        text: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        audio: {
          type: String,
          default: "",
        },
        html: {
          type: String,
          default: "",
        },
      },

      // Thêm fields cho Anki-style cloze deletion
      cloze: {
        type: String,
        default: "",
      },

      // Extra fields cho Anki import
      extraFields: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    // Thông tin từ nguồn bên ngoài
    source: {
      type: String,
      enum: ["manual", "quizlet", "anki", "import"],
      default: "manual",
    },

    // ID từ Quizlet/Anki
    externalId: {
      type: String,
      sparse: true,
    },

    // Metadata từ nguồn gốc
    sourceMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Dữ liệu học tập (Spaced Repetition)
    learning: {
      // Thuật toán SM-2 (SuperMemo)
      easeFactor: {
        type: Number,
        default: 2.5, // EF cho SM-2
      },

      // Khoảng cách lặp lại (ngày)
      interval: {
        type: Number,
        default: 1,
      },

      // Lần lặp lại thứ mấy
      repetition: {
        type: Number,
        default: 0,
      },

      // Ngày review tiếp theo
      nextReview: {
        type: Date,
        default: Date.now,
      },

      // Ngày review cuối
      lastReview: {
        type: Date,
      },

      // Số lần đúng/sai
      correctCount: {
        type: Number,
        default: 0,
      },
      incorrectCount: {
        type: Number,
        default: 0,
      },

      // Trạng thái học tập
      status: {
        type: String,
        enum: ["new", "learning", "review", "buried", "suspended"],
        default: "new",
      },

      // Deck cho Anki (nếu cần)
      deckName: {
        type: String,
        default: "",
      },
    },

    // Tags riêng cho thẻ
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Ghi chú của user
    notes: {
      type: String,
      default: "",
    },

    // Đánh dấu quan trọng
    isStarred: {
      type: Boolean,
      default: false,
    },

    // Đánh dấu khó
    isDifficult: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { cardSetId: 1, position: 1 },
      { "learning.nextReview": 1 },
      { "learning.status": 1 },
      { source: 1, externalId: 1 },
      { tags: 1 },
      { isStarred: 1 },
    ],
  }
);

// Virtual để tính progress
CardSchema.virtual("accuracy").get(function () {
  const total = this.learning.correctCount + this.learning.incorrectCount;
  if (total === 0) return 0;
  return ((this.learning.correctCount / total) * 100).toFixed(1);
});

// Method để update learning progress
CardSchema.methods.updateProgress = function (quality) {
  // quality: 0-5 (SM-2 algorithm)
  // 0-2: incorrect, 3-5: correct

  const learning = this.learning;

  if (quality >= 3) {
    learning.correctCount++;

    if (learning.repetition === 0) {
      learning.interval = 1;
    } else if (learning.repetition === 1) {
      learning.interval = 6;
    } else {
      learning.interval = Math.round(learning.interval * learning.easeFactor);
    }

    learning.repetition++;
    learning.status = learning.repetition >= 2 ? "review" : "learning";
  } else {
    learning.incorrectCount++;
    learning.repetition = 0;
    learning.interval = 1;
    learning.status = "learning";
  }

  // Update ease factor
  learning.easeFactor = Math.max(
    1.3,
    learning.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Set next review date
  learning.nextReview = new Date(
    Date.now() + learning.interval * 24 * 60 * 60 * 1000
  );
  learning.lastReview = new Date();

  return this.save();
};

const Card = mongoose.model("Card", CardSchema);
export default Card;
