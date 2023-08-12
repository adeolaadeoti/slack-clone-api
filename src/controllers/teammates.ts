import { Request, Response, NextFunction } from "express";
import Organisation from "../models/organisation";
import successResponse from "../helpers/successResponse";
import Channel from "../models/channel";
import User from "../models/user";
import sendEmail from "../helpers/sendEmail";
import { joinTeammatesEmail } from "../html/join-teammates-email";

// @desc    add teammates to either organisation or a channel
// @route   POST /api/v1/teammates
// @access  Private
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emails, channelId, organisationId, userId } = req.body;
    const channelExist = await Channel.findById(channelId);
    let organisation: any;

    const invitedBy = await User.findById(req.user.id);

    // add existed teammates to channel
    if (userId?.length > 0 && channelExist) {
      let channel: any;

      for (const id of userId) {
        try {
          channel = await Channel.findOneAndUpdate(
            { _id: channelId },
            { $push: { collaborators: id } },
            { new: true }
          ).populate("collaborators");

          const user = await User.findById(id);

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
          );
        } catch (error) {
          next(error);
        }
      }
      successResponse(res, channel);
    } else if (channelId && channelExist) {
      // add new teammates to channel
      let channel: any;

      for (const email of emails) {
        try {
          const newUser = await User.create({ email });
          channel = await Channel.findOneAndUpdate(
            { _id: channelId },
            { $push: { collaborators: newUser._id } },
            { new: true }
          ).populate("collaborators");
          await Organisation.findOneAndUpdate(
            { _id: organisationId },
            { $push: { coWorkers: newUser._id } }
          );
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
          );
        } catch (error) {
          next(error);
        }
      }
      successResponse(res, channel);
    } else if (organisationId) {
      // add new teammates to organisation
      const organisationExist = await Organisation.findById(organisationId);

      if (organisationExist) {
        for (const email of emails) {
          try {
            const existingUser = await User.findOne({ email });

            if (existingUser) {
              // Check if existingUser is not part of coWorkers field before pushing
              const isUserAlreadyInCoWorkers =
                organisationExist.coWorkers.includes(String(existingUser._id));

              if (!isUserAlreadyInCoWorkers) {
                organisation = await Organisation.findOneAndUpdate(
                  { _id: organisationId },
                  {
                    $addToSet: { coWorkers: existingUser._id },
                  },
                  { new: true }
                ).populate(["coWorkers", "owner"]);
              }
            } else {
              const newUser = await User.create({ email });
              organisation = await Organisation.findOneAndUpdate(
                { _id: organisationId },
                {
                  $push: {
                    coWorkers: newUser._id,
                  },
                },
                { new: true }
              ).populate(["coWorkers", "owner"]);
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
            );
          } catch (error) {
            next(error);
          }
        }

        if (!channelId) {
          successResponse(res, organisation);
        }
      }
    }
  } catch (error) {
    next(error);
  }
};
