import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import sendEmail from "../helpers/sendEmail";
import crypto from "crypto";
import { verificationHtml } from "../html/confirmation-code-email";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      data: {
        name: "Please provide your email address",
      },
    });
  }

  const emailExist = await User.findOne({ email });

  if (emailExist) {
    return res.status(400).json({
      success: false,
      data: {
        name: "User already exists",
      },
    });
  }

  const user = await User.create({
    username,
    email,
  });
  try {
    const verificationToken = user.getVerificationCode();
    await user.save();

    sendEmail(
      email,
      "Slack confirmation code",
      verificationHtml(verificationToken)
    );

    res.status(201).json({
      success: true,
      data: {
        name: "Verification token sent to email",
      },
    });
  } catch (err) {
    user.loginVerificationCode = undefined;
    user.loginVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(err);
  }
};

// @desc    Verify user
// @route   POST /api/v1/auth/verify
// @access  Public
export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.loginVerificationCode) {
      return res.status(400).json({
        success: false,
        data: {
          name: "Please provide verification token",
        },
      });
    }
    // Get hashed token
    const loginVerificationCode = crypto
      .createHash("sha256")
      .update(req.body.loginVerificationCode)
      .digest("hex");

    const user = await User.findOne({
      loginVerificationCode,
      loginVerificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        data: {
          name: "Invalid verification token",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        token: user.getSignedJwtToken(),
      },
    });

    user.loginVerificationCode = undefined;
    user.loginVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    next(err);
  }
};
