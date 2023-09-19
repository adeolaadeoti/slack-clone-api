import { Request, Response, NextFunction } from 'express'
import Conversations from '../models/conversation'
import successResponse from '../helpers/successResponse'
import { UserSchemaType } from 'src/models/user'

export async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.body
    const conversations = await Conversations.find({ organisation: id }).sort({
      _id: -1,
    })
    successResponse(res, conversations)
  } catch (error) {
    next(error)
  }
}

export async function getConversation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id
    const conversation = await Conversations.findById(id)
      .populate('collaborators')
      .sort({ _id: -1 })

    if (!conversation) {
      return res.status(400).json({
        name: 'not found',
      })
    }

    // const conversations = await Conversations.findById(id).populate(
    //   'collaborators'
    // )
    const collaborators = [...conversation.collaborators]
    // Find the index of the collaborator with the current user's ID
    const currentUserIndex = conversation.collaborators.findIndex(
      (coworker: UserSchemaType) => coworker._id.toString() === req.user.id
    )

    //   // Remove the current user collaborator from the array
    conversation.collaborators.splice(currentUserIndex, 1)

    //   // Create the name field based on the other collaborator's username
    const name = conversation.collaborators[0]?.username || conversation.name

    successResponse(res, {
      ...conversation.toObject(),
      name,
      collaborators,
    })
  } catch (error) {
    next(error)
  }
}
