import { Request, Response, NextFunction } from "express";
import Message from "../models/message";
import successResponse from "../helpers/successResponse";

// @desc    get messages
// @route   POST /api/v1/message
// @access  Private
export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const channelId = req.query.channelId;
    const conversationId = req.query.conversation;
    const isSelf = req.query.isSelf;
    // const collaborators = req.query.collaborators;
    const organisation = req.query.organisation;

    if (channelId) {
      const channel = await Message.find({
        channel: channelId,
        organisation,
      }).populate("sender");
      successResponse(res, channel);
    } else if (conversationId) {
      let conversation;

      if (isSelf) {
        conversation = await Message.find({
          organisation,
          conversation: conversationId,
          isSelf,
        }).populate("sender");
      } else {
        conversation = await Message.find({
          organisation,
          conversation: conversationId,
        }).populate("sender");
      }
      successResponse(res, conversation);
    } else {
      res.status(400).json({});
    }
  } catch (error) {
    next(error);
  }
}
