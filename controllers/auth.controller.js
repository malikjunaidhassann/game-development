import JWT from "../utils/jwt.util.js";
import Nano from "../utils/nano.util.js";
import Mailer from "../utils/mailer.util.js";
import Bcrypt from "../utils/bcrypt.util.js";
import User from "../models/user.model.js";
import Admin from "../models/superAdmin.model.js";

import s3Service from "../services/s3Service.js";
import GoogleService from "../services/googlService.js";
import GameHistory from "../models/gameHistory.model.js";
import mongoose from "mongoose";
import { TournamentResult } from "../models/table.model.js";

const AuthController = {
  async signUp(req, res) {
    const { email, userName, password } = req.bodyValue;
    const { file } = req;

    const existingProfileByEmail = await User.findOne({
      email,
    });

    if (existingProfileByEmail) {
      await s3Service.deleteFile(file?.key);
      return res.status(400).json({ success: false, message: "Email already exists." });
    }
    const emailVerificationCode = Nano.getCode({});
    const hashedPassword = await Bcrypt.getHash({ data: password });
    const user = await User.create({
      userName,
      email,
      emailVerificationCode,
      password: hashedPassword,
      profile: file?.location || "",
    });

    const token = JWT.sign({ _id: user._id });
    const data = user.toObject();
    delete data.password;
    delete data.emailVerificationCode;

    await Mailer.sendVerificationEmail({
      email,
      code: emailVerificationCode,
      name: `${userName}`,
    });

    return res.status(201).json({
      success: true,
      token,
      data,
      message: "Account created successfully!",
    });
  },
  async googleSignIn(req, res) {
    const { email } = req.bodyValue;

    let user = await User.findOne({ email, isDeleted: false });

    if (user) {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        userName: email,
        isEmailVerified: true,
      });
    }

    const token = JWT.sign({ _id: user._id });
    const obj = user.toObject();
    delete obj.password;

    return res.status(200).json({
      success: true,
      token,
      user: obj,
      message: user ? "Login successful!" : "Account created successfully!",
    });
  },
  async verifyEmail(req, res) {
    const { _id } = req.user;
    const { code } = req.bodyValue;
    const user = await User.findOne({ _id, isDeleted: false }).select(["+emailVerificationCode"]);

    if (!user) return res.status(404).json({ success: false, message: "user does not exists." });

    if (user.isEmailVerified)
      return res.status(400).json({ success: false, message: "Email already verified.", user });

    if (user.emailVerificationCode !== code)
      return res.status(400).json({ success: false, message: "Invalid code." });

    user.isEmailVerified = true;
    await user.save();

    const data = user.toObject();
    delete data.emailVerificationCode;

    return res.status(200).json({
      success: true,
      user: data,
      message: "Email successfully verified.",
    });
  },
  async superAdminSignIn(req, res) {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Email does not exist." });
    }

    const passwordValid = await Bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(400).json({ success: false, message: "Incorrect password." });
    }
    const token = JWT.sign({ _id: user._id });
    const data = user.toObject();
    delete data.password;

    return res.status(200).json({
      success: true,
      token,
      user: data,
    });
  },
  async signIn(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isDeleted: false })
      .select("+password")
      .select("+isEmailVerified");

    if (!user) {
      return res.status(404).json({ success: false, message: "User Does Not Exist." });
    }

    const passwordValid = await Bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(400).json({ success: false, message: "Incorrect Password." });
    }
    const token = JWT.sign({ _id: user._id });
    const data = user.toObject();
    delete data.password;

    return res.status(200).json({
      success: true,
      token,
      user: data,
    });
  },
  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({ success: false, message: "User Does Not Exist." });
    }

    const resetCode = Nano.getCode({});
    user.resetCode = resetCode;

    await Mailer.sendPasswordResetEmail({
      email,
      resetCode,
      name: `${user.userName}`,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email Sent to Recover Password",
    });
  },
  async resetPassword(req, res) {
    const { email, password, resetCode } = req.body;
    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({ success: false, message: "User Does Not Exist." });
    }

    if (user.resetCode !== resetCode) {
      return res.status(404).json({ success: false, message: "Invalid Reset Code." });
    }

    const hashedPassword = await Bcrypt.getHash({ data: password });
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  },
  async getCarromUser(req, res) {
    const data = await User.find();
    return res.status(200).json({
      success: true,
      data,
    });
  },
  async blockUser(req, res) {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isBlocked) {
      await User.findByIdAndUpdate(userId, { isBlocked: false });
    } else {
      await User.findByIdAndUpdate(userId, { isBlocked: true });
    }

    const data = await User.find();

    return res.status(200).json({
      success: true,
      message: `User with userName ${user.userName} has been ${user.isBlocked ? "unblocked" : "blocked"}.`,
      data,
    });
  },
  async getUserStats(req, res) {
    const { _id } = req.user;

    const firstDiscoPoolStats = await GameHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(_id), gameType: "firstDiscoPool" } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$gameResult.status", "win"] }, 1, 0] } },
        },
      },
    ]);

    const playCarromStats = await GameHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(_id), gameType: "playCarrom" } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$gameResult.status", "win"] }, 1, 0] } },
        },
      },
    ]);

    const freeStyleStats = await GameHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(_id), gameType: "freeStyle" } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$gameResult.status", "win"] }, 1, 0] } },
        },
      },
    ]);

    const gameTypes = ["firstDiscoPool", "playCarrom", "freeStyle"];

    const userStats = {
      firstDiscoPool: { tournamentsWon: 0 },
      playCarrom: { tournamentsWon: 0 },
      freeStyle: { tournamentsWon: 0 },
    };

    for (const gameType of gameTypes) {
      const tournamentsWon = await TournamentResult.aggregate([
        { $unwind: "$results" },
        {
          $match: {
            "results.userId": new mongoose.Types.ObjectId(_id),
            "results.rank": { $lte: 10 },
            "results.gameType": gameType,
          },
        },
        { $count: "tournamentsWon" },
      ]);

      console.log({ tournamentsWon: tournamentsWon });

      userStats[gameType].tournamentsWon = tournamentsWon[0]?.tournamentsWon || 0;
    }

    const response = {
      firstDiscoPool: {
        totalGames: firstDiscoPoolStats[0]?.totalGames || 0,
        wins: firstDiscoPoolStats[0]?.wins || 0,
      },
      playCarrom: {
        totalGames: playCarromStats[0]?.totalGames || 0,
        wins: playCarromStats[0]?.wins || 0,
      },
      freeStyleStats: {
        totalGames: freeStyleStats[0]?.totalGames || 0,
        wins: freeStyleStats[0]?.wins || 0,
      },
      tournamentStats: userStats,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  },
};

export default AuthController;
