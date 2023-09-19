import { Request, Response, NextFunction } from 'express'
import Organisation, { OrganisationSchemaType } from '../models/organisation'
import Conversation from '../models/conversation'
import successResponse from '../helpers/successResponse'
import Channel, { ChannelSchemaType } from '../models/channel'
import User from '../models/user'
import sendEmail from '../helpers/sendEmail'
import { joinTeammatesEmail } from '../html/join-teammates-email'

// @desc    add teammates to either organisation or a channel
// @route   POST /api/v1/teammates
// @access  Private
export async function createTeammates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { emails, channelId, organisationId, userIds } = req.body
    const channelExist = await Channel.findById(channelId)
    let organisation: OrganisationSchemaType

    const invitedBy = await User.findById(req.user.id)

    // add existed teammates to channel
    if (userIds?.length > 0 && channelExist) {
      let channel: ChannelSchemaType

      for (const id of userIds) {
        try {
          channel = await Channel.findOneAndUpdate(
            { _id: channelId },
            { $addToSet: { collaborators: id } },
            { new: true }
          ).populate('collaborators')

          const user = await User.findById(id)

          sendEmail(
            user.email,
            `${invitedBy.email} has invited you to work with them in Slack`,
            joinTeammatesEmail(
              invitedBy.username,
              invitedBy.email,
              organisation.name,
              req.user.id,
              organisation.joinLink,
              organisation.url
            )
          )
        } catch (error) {
          next(error)
        }
      }
      successResponse(res, channel)
    } else if (channelId && channelExist) {
      // add new teammates to channel
      let channel: ChannelSchemaType

      for (const email of emails) {
        try {
          const newUser = await User.create({ email })
          channel = await Channel.findOneAndUpdate(
            { _id: channelId },
            { $push: { collaborators: newUser._id } },
            { new: true }
          ).populate('collaborators')
          await Organisation.findOneAndUpdate(
            { _id: organisationId },
            { $push: { coWorkers: newUser._id } }
          )
          // send email to the ids
          sendEmail(
            email,
            `${invitedBy.email} has invited you to work with them in Slack`,
            joinTeammatesEmail(
              invitedBy.username,
              invitedBy.email,
              organisation.name,
              req.user.id,
              organisation.joinLink,
              organisation.url
            )
          )
        } catch (error) {
          next(error)
        }
      }
      successResponse(res, channel)
    } else if (organisationId) {
      // add new teammates to organisation
      const organisationExist = await Organisation.findById(organisationId)

      if (organisationExist) {
        for (const email of emails) {
          try {
            const existingUser = await User.findOne({ email })

            if (existingUser) {
              // Check if existingUser is not part of coWorkers field before pushing
              const isUserAlreadyInCoWorkers =
                organisationExist.coWorkers.includes(existingUser._id)

              if (!isUserAlreadyInCoWorkers) {
                organisation = await Organisation.findOneAndUpdate(
                  { _id: organisationId },
                  {
                    $addToSet: { coWorkers: existingUser._id },
                  },
                  { new: true }
                ).populate(['coWorkers', 'owner'])
              }
            } else {
              const newUser = await User.create({ email })
              organisation = await Organisation.findOneAndUpdate(
                { _id: organisationId },
                {
                  $push: {
                    coWorkers: newUser._id,
                  },
                },
                { new: true }
              ).populate(['coWorkers', 'owner'])
            }

            // vibe and inshallah
            sendEmail(
              email,
              `${invitedBy.email} has invited you to work with them in Slack`,
              joinTeammatesEmail(
                invitedBy.username,
                invitedBy.email,
                organisation.name,
                req.user.id,
                organisation.joinLink,
                organisation.url
              )
            )
          } catch (error) {
            next(error)
          }
        }

        if (!channelId) {
          successResponse(res, organisation)
        }

        // Create separate conversations for each unique pair of coWorkers
        for (let i = 0; i < organisation.coWorkers.length; i++) {
          for (let j = i + 1; j < organisation.coWorkers.length; j++) {
            // Check if a conversation with these collaborators already exists
            const existingConversation = await Conversation.findOne({
              collaborators: {
                $all: [
                  organisation.coWorkers[i]._id,
                  organisation.coWorkers[j]._id,
                ],
              },
              organisation: organisationId,
            })

            // If no conversation exists, create a new one
            if (!existingConversation) {
              await Conversation.create({
                name: `${organisation.coWorkers[i].username}, ${organisation.coWorkers[j].username}`,
                description: `This conversation is between ${organisation.coWorkers[i].username} and ${organisation.coWorkers[j].username}`,
                organisation: organisationId,
                isSelf:
                  organisation.coWorkers[i]._id ===
                  organisation.coWorkers[j]._id,
                collaborators: [
                  organisation.coWorkers[i]._id,
                  organisation.coWorkers[j]._id,
                ],
              })
            }
          }
        }

        // Create self-conversations for each coworker
        for (let i = 0; i < organisation.coWorkers.length; i++) {
          const selfConversationExists = await Conversation.findOne({
            collaborators: {
              $all: [organisation.coWorkers[i]._id],
            },
            organisation: organisationId,
            isSelf: true,
          })

          // If no self-conversation exists, create one
          if (!selfConversationExists) {
            await Conversation.create({
              name: `${organisation.coWorkers[i].username}`,
              description: `This is a conversation with oneself (${organisation.coWorkers[i].username}).`,
              organisation: organisationId,
              isSelf: true,
              collaborators: [organisation.coWorkers[i]._id],
            })
          }
        }
      }
    }
  } catch (error) {
    next(error)
  }
}

// @desc    get a teammate of an organisation
// @route   GET /api/v1/teammates
// @access  Private
export async function getTeammate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const coworkerId = req.params.id
    const coworker = await User.findById(coworkerId)
    // console.log(coworker);
    if (!coworker) {
      return res.status(400).json({
        name: 'Coworker not found',
      })
    }

    return successResponse(res, coworker)
  } catch (error) {
    next(error)
  }
}
