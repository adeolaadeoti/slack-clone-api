import mongoose from "mongoose";

interface ConversationSchemaType {
  name: string;
  collaborators: mongoose.Schema.Types.ObjectId[];
  title: string;
  description: string;
  isSelf: boolean;
  organisation: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  hasUnreadMessages: boolean;
  isConversation: boolean;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new mongoose.Schema<ConversationSchemaType>(
  {
    name: {
      type: String,
      default() {
        if (this.createdBy) {
          return this.createdBy.username;
        }
        return "";
      },
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
      default() {
        return `This conversation is just between ${this.name} and you`;
      },
    },
    isSelf: {
      type: Boolean,
      default: false,
    },
    isConversation: {
      type: Boolean,
      default: true,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    hasUnreadMessages: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Conversation", conversationSchema);
