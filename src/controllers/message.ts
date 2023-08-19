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
    const isSelf = req.query.isSelf;
    const collaborators = req.query.collaborators;
    if (channelId) {
      const channel = await Message.find({
        channel: channelId,
      }).populate("sender");
      successResponse(res, channel);
    } else if (collaborators) {
      let conversation;
      const collaboratorsArray = collaborators.split(",");

      if (collaboratorsArray.length === 2) {
        if (isSelf) {
          conversation = await Message.find({
            $and: [
              { collaborators: collaboratorsArray[0] },
              { collaborators: collaboratorsArray[1] },
              { isSelf },
            ],
          }).populate("sender");
        } else {
          conversation = await Message.find({
            $and: [
              { collaborators: collaboratorsArray[0] },
              { collaborators: collaboratorsArray[1] },
            ],
          }).populate("sender");
        }

        successResponse(res, conversation);
      } else {
        res.status(400).json({});
      }
    } else {
      res.status(400).json({});
    }
  } catch (error) {
    next(error);
  }
}
