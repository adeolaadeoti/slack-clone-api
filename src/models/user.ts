import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import randomize from "randomatic";

interface UserSchemaType {
  username: string;
  email: string;
  role: string;
  phone: string;
  profilePicture: string;
  isOnline: boolean;
  loginVerificationCode: string;
  loginVerificationCodeExpires: Date;
  getSignedJwtToken: () => string;
  getVerificationCode: () => string;
}

const userSchema = new mongoose.Schema<UserSchemaType>(
  {
    username: {
      type: String,
      default() {
        return this.email.split("@")[0];
      },
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please enter a valid email"],
    },
    isOnline: Boolean,
    role: String,
    phone: String,
    profilePicture: String,
    loginVerificationCode: String,
    loginVerificationCodeExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate login verification code
userSchema.methods.getVerificationCode = function () {
  const verificationCode = randomize("Aa0", 6);

  this.loginVerificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");

  this.loginVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationCode;
};

export default mongoose.model("User", userSchema);
