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

    let updatedOrganisation: any;
    for (const email of coWorkers) {
      try {
        const newUser = await User.create({ email });
        updatedOrganisation = await Organisation.findOneAndUpdate(
          { _id: organisation._id },
          { $push: { coWorkers: newUser._id } },
          { new: true }
        ).populate(["coWorkers", "owner"]);
      } catch (error) {
        next(error);
      }
    }

    updatedOrganisation.generateJoinLink();
    await updatedOrganisation.save();

    successResponse(res, updatedOrganisation);
  } catch (error) {
    next(error);
  }
}
