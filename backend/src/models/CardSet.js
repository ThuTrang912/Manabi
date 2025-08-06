import mongoose from "mongoose";

const CardSetSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Thông tin về nguồn dữ liệu
    source: {
      type: String,
      enum: ["manual", "quizlet", "anki", "import"],
      default: "manual",
    },

    // ID từ nguồn bên ngoài (Quizlet/Anki)
    externalId: {
      type: String,
      sparse: true, // Chỉ index những document có giá trị
    },

    // URL gốc từ Quizlet/Anki (để sync lại sau này)
    sourceUrl: {
      type: String,
      default: "",
    },

    // Metadata từ Quizlet/Anki
    sourceMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Cài đặt học tập
    settings: {
      // Kiểu học (flashcard, multiple choice, etc.)
      studyModes: [
        {
          type: String,
          enum: [
            "flashcard",
            "multiple_choice",
            "true_false",
            "written",
            "match",
          ],
          default: "flashcard",
        },
      ],

      // Thuật toán lặp lại (spaced repetition)
      algorithm: {
        type: String,
        enum: ["sm2", "anki", "manual"],
        default: "sm2",
      },

      // Cài đặt khác
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowDownload: {
        type: Boolean,
        default: false,
      },
    },

    // Thống kê
    stats: {
      totalCards: {
        type: Number,
        default: 0,
      },
      studyCount: {
        type: Number,
        default: 0,
      },
      lastStudied: {
        type: Date,
      },
    },

    // Tags để phân loại
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Thư mục chứa (nếu có)
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },

    // Ngôn ngữ
    language: {
      front: {
        type: String,
        default: "en",
      },
      back: {
        type: String,
        default: "vi",
      },
    },
  },
  {
    timestamps: true,
    // Index để tìm kiếm nhanh
    indexes: [
      { userId: 1, name: 1 },
      { source: 1, externalId: 1 },
      { tags: 1 },
      { "stats.lastStudied": -1 },
    ],
  }
);

// Index compound để tránh duplicate từ external source
CardSetSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      externalId: { $exists: true, $ne: null },
    },
  }
);

const CardSet = mongoose.model("CardSet", CardSetSchema);
export default CardSet;
