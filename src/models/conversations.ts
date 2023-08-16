import mongoose from "mongoose";

interface ConversationSchemaType {
  name: string;
  createdBy: mongoose.Schema.Types.ObjectId & { _id: string };
  collaborators: mongoose.Schema.Types.ObjectId[];
  title: string;
  description: string;
  organisation: mongoose.Schema.Types.ObjectId;
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Conversation", conversationSchema);
