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
      if (channelExist) {
        emails.forEach(async (email) => {
          try {
            const newUser = await User.create({ email });
            await Channel.findOneAndUpdate(
              { _id: channelId },
              { $push: { collaborators: newUser.id } }
            );
            await Organisation.findOneAndUpdate(
              { _id: organisationId },
              { $push: { coWorkers: newUser.id } }
            );
          } catch (error) {
            next(error);
          }
        });
        successResponse(res, { message: "success" });
      }
    }

    if (organisationId) {
      emails.map(async (email) => {
        try {
          const newUser = await User.create({ email });
          await Organisation.findOneAndUpdate(
            { _id: organisationId },
            { $push: { emails: newUser.id } }
          );
        } catch (error) {
          next(error);
        }
      });
      successResponse(res, { message: "success" });
    }
  } catch (error) {
    next(error);
  }
};
