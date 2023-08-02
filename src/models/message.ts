import mongoose from "mongoose";

enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

interface MessageSchemaType {
  sender: mongoose.Schema.Types.ObjectId;
  text: string;
  messageType: MessageType;
  channel: mongoose.Schema.Types.ObjectId;
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
    text: {
      type: String,
      required: [true, "Please enter your message"],
    },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
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
