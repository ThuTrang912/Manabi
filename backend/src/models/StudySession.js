import mongoose from "mongoose";

// Model để lưu lịch sử học tập
const StudySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cardSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CardSet",
      required: true,
    },

    // Thống kê session
    stats: {
      totalCards: {
        type: Number,
        required: true,
      },
      correctAnswers: {
        type: Number,
        default: 0,
      },
      incorrectAnswers: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number, // seconds
        default: 0,
      },
      studyMode: {
        type: String,
        enum: [
          "flashcard",
          "multiple_choice",
          "true_false",
          "written",
          "match",
        ],
        required: true,
      },
    },

    // Chi tiết từng thẻ đã học
    cardResults: [
      {
        cardId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Card",
          required: true,
        },
        quality: {
          type: Number, // 0-5 for SM-2
          required: true,
        },
        responseTime: {
          type: Number, // milliseconds
          default: 0,
        },
        attempts: {
          type: Number,
          default: 1,
        },
      },
    ],

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { cardSetId: 1, createdAt: -1 },
      { "stats.studyMode": 1 },
    ],
  }
);

// Virtual để tính accuracy
StudySessionSchema.virtual("accuracy").get(function () {
  const total = this.stats.correctAnswers + this.stats.incorrectAnswers;
  if (total === 0) return 0;
  return ((this.stats.correctAnswers / total) * 100).toFixed(1);
});

const StudySession = mongoose.model("StudySession", StudySessionSchema);
export default StudySession;
