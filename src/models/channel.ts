import mongoose from 'mongoose'
// import { v4 as uuidv4 } from "uuid";

export interface ChannelSchemaType {
  name: string
  collaborators: mongoose.Schema.Types.ObjectId[]
  title: string
  description: string
  organisation: mongoose.Schema.Types.ObjectId
  hasNotOpen: mongoose.Schema.Types.ObjectId[]
  isChannel: boolean
  // conversations: mongoose.Schema.Types.ObjectId[];
  createdAt: Date
  updatedAt: Date
}

const channelSchema = new mongoose.Schema<ChannelSchemaType>(
  {
    name: {
      type: String,
      required: [true, 'Please enter your channel name'],
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    title: {
      type: String,
      default() {
        return `This is the very first begining of the ${this.name} channel`
      },
    },
    description: {
      type: String,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
    },
    hasNotOpen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isChannel: {
      type: Boolean,
      default: true,
    },
    // conversations: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Message",
    //   },
    // ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export default mongoose.model('Channel', channelSchema)
