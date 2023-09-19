import mongoose from 'mongoose'

interface ThreadSchemaType {
  sender: mongoose.Schema.Types.ObjectId
  content: string
  message: mongoose.Schema.Types.ObjectId
  reactions: {
    emoji: string
    reactedToBy: [mongoose.Schema.Types.ObjectId]
  }[]
  isBookmarked: boolean
  hasRead: boolean
  createdAt: Date
  updatedAt: Date
}

const threadSchema = new mongoose.Schema<ThreadSchemaType>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    message: mongoose.Schema.Types.ObjectId,
    reactions: [
      {
        emoji: String,
        reactedToBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    isBookmarked: {
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
)

export default mongoose.model('Thread', threadSchema)
