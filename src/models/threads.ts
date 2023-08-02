import mongoose from "mongoose";

interface ThreadSchemaType {
  user: mongoose.Schema.Types.ObjectId;
  channel: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  conversation: mongoose.Schema.Types.ObjectId[];
}

const threadSchema = new mongoose.Schema<ThreadSchemaType>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    conversation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Thread", threadSchema);
