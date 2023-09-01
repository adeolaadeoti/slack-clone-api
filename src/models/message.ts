import mongoose from "mongoose";

interface MessageSchemaType {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  channel: mongoose.Schema.Types.ObjectId;
  organisation: mongoose.Schema.Types.ObjectId;
  conversation: mongoose.Schema.Types.ObjectId;
  collaborators: mongoose.Schema.Types.ObjectId[];
  reactions: {
    emoji: string;
    reactedToBy: [mongoose.Schema.Types.ObjectId];
  }[];
  threadReplies: mongoose.Schema.Types.ObjectId[];
  threadLastReplyDate: Date;
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
        emoji: String,
        reactedToBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    threadReplies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    threadLastReplyDate: Date,
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
