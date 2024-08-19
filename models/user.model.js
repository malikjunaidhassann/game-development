import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    profile: {
      type: String,
    },
    emailVerificationCode: {
      type: String,
    },
    resetCode: {
      type: String,
    },
    coins: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
