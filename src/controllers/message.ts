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
    if (channelId) {
      const channel = await Message.find({
        channel: channelId,
      }).populate("sender");
      successResponse(res, channel);
    } else {
      successResponse(res, []);
    }
  } catch (error) {
    next(error);
  }
}
