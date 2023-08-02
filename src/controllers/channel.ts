import { Request, Response, NextFunction } from "express";
import Channel from "../models/channel";
import successResponse from "../helpers/successResponse";

// @desc    create channel
// @route   POST /api/v1/channel/create
// @access  Private
export async function createChannel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, organisationId } = req.body;
    const channel = await Channel.create({
      name,
      collaborators: [req.user.id],
      organisation: organisationId,
    });
    successResponse(res, channel);
  } catch (error) {
    next(error);
  }
}

export async function getChannels(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    const channels = await Channel.find({ organisation: id })
      .populate(["collaborators", "organisation"])
      .sort({ _id: -1 });
    successResponse(res, channels);
  } catch (error) {
    next(error);
  }
}
