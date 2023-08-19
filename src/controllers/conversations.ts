import { Request, Response, NextFunction } from "express";
import Conversations from "../models/conversations";
import successResponse from "../helpers/successResponse";

export async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.body;
    const conversations = await Conversations.find({ organisation: id }).sort({
      _id: -1,
    });
    successResponse(res, conversations);
  } catch (error) {
    next(error);
  }
}

export async function getConversation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    const conversation = await Conversations.findById(id)
      .populate(["collaborators", "createdBy"])
      .sort({ _id: -1 });

    if (!conversation) {
      return res.status(400).json({
        name: "not found",
      });
    }
    // Check if the createdBy user's _id matches req.user.id
    const isOwner = conversation.createdBy._id.toString() === req.user.id;

    // Add isOwner field to the channel object
    const channelWithOwnerStatus = {
      ...conversation.toObject(),
      isOwner,
      isConversation: true,
    };

    successResponse(res, channelWithOwnerStatus);
  } catch (error) {
    next(error);
  }
}
