import mongoose from "mongoose";

// enum MessageType {
//   TEXT = "text",
//   IMAGE = "image",
//   VIDEO = "video",
//   AUDIO = "audio",
//   FILE = "file",
// }

interface MessageSchemaType {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  channel: mongoose.Schema.Types.ObjectId;
  conversation: mongoose.Schema.Types.ObjectId;
  reactions: mongoose.Schema.Types.ObjectId[];
  replies: mongoose.Schema.Types.ObjectId[];
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<MessageSchemaType>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: String,
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        emoji: {
          symbol: String,
          name: String,
        },
        ref: "User",
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Message", messageSchema);
