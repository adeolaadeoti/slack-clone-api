import mongoose from "mongoose";

interface MessageSchemaType {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  channel: mongoose.Schema.Types.ObjectId;
  organisation: mongoose.Schema.Types.ObjectId;
  conversation: mongoose.Schema.Types.ObjectId;
  collaborators: mongoose.Schema.Types.ObjectId[];
  reactions: mongoose.Schema.Types.ObjectId[];
  replies: mongoose.Schema.Types.ObjectId[];
  isBookmarked: boolean;
  isSelf: boolean;
  hasRead: boolean;
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
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    isSelf: {
      type: Boolean,
      default: false,
    },
    hasRead: {
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
