import mongoose from "mongoose";

const SubFolderSchema = new mongoose.Schema(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SubFolder", SubFolderSchema);
