import { Request, Response, NextFunction } from "express";
import Organisation from "../models/organisation";
import successResponse from "../helpers/successResponse";

// @desc    get organisation
// @route   GET /api/v1/organisation/:id
// @access  Private
export async function getOrganisation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    if (id) {
      const organisation = await Organisation.findById(id).populate([
        "coWorkers",
        "owner",
      ]);

      successResponse(res, organisation);
    }
  } catch (error) {
    next(error);
  }
}
// @desc    get organisation
// @route   POST /api/v1/organisation
// @access  Private
export async function createOrganisation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, id } = req.body;

    if (!name && !id) {
      const organisation = await Organisation.create({
        owner: req.user.id,
        coWorkers: [req.user.id],
      });

      successResponse(res, organisation);
    }

    if (name && id) {
      const organisation = await Organisation.findOneAndUpdate(
        { _id: id },
        { $set: { name } },
        { new: true }
      ).populate(["coWorkers", "owner"]);

      organisation.generateJoinLink();
      await organisation.save();
      successResponse(res, organisation);
    }
  } catch (error) {
    next(error);
  }
}
