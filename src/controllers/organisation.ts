import { Request, Response, NextFunction } from 'express'
import Organisation from '../models/organisation'
import successResponse from '../helpers/successResponse'
import Channel from '../models/channel'
import Conversations from '../models/conversation'
import { UserSchemaType } from 'src/models/user'

// @desc    get organisation
// @route   GET /api/v1/organisation/:id
// @access  Private
export async function getOrganisation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id
    if (id) {
      let organisation = await Organisation.findById(id).populate([
        'coWorkers',
        'owner',
      ])

      if (!organisation) {
        res.status(400, {
          name: 'no organisation found',
        })
      }

      const channels = await Channel.find({
        organisation: id,
      }).populate('collaborators')

      const conversations = await Conversations.find({
        organisation: id,
      }).populate('collaborators')

      const conversationsWithCurrentUser = conversations.filter(
        (conversation) =>
          conversation.collaborators.some(
            (collaborator: UserSchemaType) =>
              collaborator._id.toString() === req.user.id
          )
      )

      const updatedConversations = conversationsWithCurrentUser.map((convo) => {
        // Find the index of the collaborator with the current user's ID
        const currentUserIndex = convo.collaborators.findIndex(
          (coworker: UserSchemaType) => coworker._id.toString() === req.user.id
        )

        const collaborators = [...convo.collaborators]

        // Remove the current user collaborator from the array
        convo.collaborators.splice(currentUserIndex, 1)

        // Create the name field based on the other collaborator's username
        const name = convo.collaborators[0]?.username || convo.name

        return {
          ...convo.toObject(),
          name,
          createdBy: convo.collaborators[0]?._id,
          collaborators,
        }
      })

      // Check if the authenticated user is a co-worker of the organisation
      const currentUserIsCoWorker = organisation.coWorkers.some(
        (coworker: UserSchemaType) => coworker._id.toString() === req.user.id
      )

      // Replace the profile object with the corresponding co-worker's values
      let profile: UserSchemaType
      if (currentUserIsCoWorker) {
        const currentUser = organisation.coWorkers.find(
          (coworker: UserSchemaType) => coworker._id.toString() === req.user.id
        )
        profile = currentUser
      }

      // Update the coWorkers array in the organisation object
      const updatedOrganisation = {
        ...organisation.toObject(),
        conversations: updatedConversations,
        channels,
        profile,
      }

      successResponse(res, updatedOrganisation)
    }
  } catch (error) {
    next(error)
  }
}
// @desc    get organisation
// @route   POST /api/v1/organisation
// @access  Private
export async function createOrganisation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, id } = req.body

    if (!name && !id) {
      const organisation = await Organisation.create({
        owner: req.user.id,
        coWorkers: [req.user.id],
      })

      successResponse(res, organisation)
    }

    if (name && id) {
      const organisation = await Organisation.findOneAndUpdate(
        { _id: id },
        { $set: { name } },
        { new: true }
      ).populate(['coWorkers', 'owner'])

      organisation.generateJoinLink()
      await organisation.save()
      successResponse(res, organisation)
    }
  } catch (error) {
    next(error)
  }
}

// @desc    get organisations associated with an email
// @route   POST /api/v1/organisation/workspaces
// @access  Private
export async function getWorkspaces(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.user.id
    // Find all organizations where the user is a co-worker
    const workspaces = await Organisation.find({ coWorkers: id })
    // Fetch channels for each organization
    const workspacesWithChannels = await Promise.all(
      workspaces.map(async (workspace) => {
        const channels = await Channel.find({ organisation: workspace._id })
        return {
          ...workspace.toObject(),
          channels,
        }
      })
    )

    successResponse(res, workspacesWithChannels)

    // successResponse(res, workspaces);
  } catch (error) {
    next(error)
  }
}
