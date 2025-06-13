import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    message: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        timestamps: { type: Number, required: true },
      },
    ],
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default function getChatModel() {
  return mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
}
