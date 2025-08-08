import mongoose from "mongoose";

// Stores which user starred which card (and in which set for quick querying)
const StarredCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      index: true,
      required: true,
    },
    cardSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CardSet",
      index: true,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    indexes: [
      { userId: 1, cardId: 1 },
      { userId: 1, cardSetId: 1 },
    ],
  }
);

StarredCardSchema.index({ userId: 1, cardId: 1 }, { unique: true });

const StarredCard = mongoose.model("StarredCard", StarredCardSchema);
export default StarredCard;
