import { Request, Response, NextFunction } from "express";
import Organisation from "../models/organisation";
import User from "../models/user";
import successResponse from "../helpers/successResponse";

// @desc    onboard user
// @route   POST /api/v1/onboard
// @access  Private
export default async function onboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, coWorkers } = req.body;

    const organisation = await Organisation.create({
      owner: req.user.id,
      name,
      coWorkers: [req.user.id],
    });

    coWorkers.map(async (email) => {
      try {
        const newUser = await User.create({ email });
        await Organisation.findOneAndUpdate(
          { _id: organisation.id },
          { $push: { coWorkers: newUser.id } }
        );
      } catch (error) {
        next(error);
      }
    });

    successResponse(res, { message: "success" });
  } catch (error) {
    next(error);
  }
}
