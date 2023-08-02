import { Request, Response, NextFunction } from "express";
import Organisation from "../models/organisation";
import successResponse from "../helpers/successResponse";
import Channel from "../models/channel";
import User from "../models/user";

// @desc    add teammates to either organisation or a channel
// @route   POST /api/v1/teammates
// @access  Private
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emails, channelId, organisationId } = req.body;

    if (channelId) {
      const channelExist = await Channel.findById(channelId);
      let channel: any;
      if (channelExist) {
        for (const email of emails) {
          try {
            const newUser = await User.create({ email });
            channel = await Channel.findOneAndUpdate(
              { _id: channelId },
              { $push: { collaborators: newUser._id } },
              { new: true }
            );
            await Organisation.findOneAndUpdate(
              { _id: organisationId },
              { $push: { coWorkers: newUser._id } }
            );
          } catch (error) {
            next(error);
          }
        }
        channel = await channel.populate("collaborators");
        successResponse(res, channel);
      }
    }

    let organisation: any;
    if (organisationId) {
      const organisationExist = await Organisation.findById(organisationId);
      if (organisationExist) {
        for (const email of emails) {
          try {
            const newUser = await User.create({ email });
            organisation = await Organisation.findOneAndUpdate(
              { _id: organisationId },
              { $push: { emails: newUser._id } },
              { new: true }
            );
          } catch (error) {
            next(error);
          }
        }
        if (organisationId && !channelId) {
          organisation = await organisation.populate(["coWorkers", "owner"]);
          successResponse(res, organisation);
        }
      }
    }
    
  } catch (error) {
    next(error);
  }
};
