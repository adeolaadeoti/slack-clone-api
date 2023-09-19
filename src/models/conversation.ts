import mongoose from 'mongoose'
import { UserSchemaType } from './user'

export interface ConversationSchemaType {
  name: string
  collaborators: mongoose.Schema.Types.ObjectId[] & UserSchemaType[]
  description: string
  isSelf: boolean
  organisation: mongoose.Schema.Types.ObjectId
  createdBy: mongoose.Schema.Types.ObjectId
  hasNotOpen: mongoose.Schema.Types.ObjectId[]
  isConversation: boolean
  isOnline: boolean
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new mongoose.Schema<ConversationSchemaType>(
  {
    name: {
      type: String,
      default() {
        if (this.createdBy) {
          return this.createdBy.username
        }
        return ''
      },
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    description: {
      type: String,
      default() {
        return `This conversation is just between ${this.name} and you`
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
      ref: 'Organisation',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    hasNotOpen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Define a compound index on the collaborators field
conversationSchema.index({ collaborators: 1 })

export default mongoose.model('Conversation', conversationSchema)
