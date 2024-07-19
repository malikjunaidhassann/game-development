import JWT from "../utils/jwt.util.js";
import Nano from "../utils/nano.util.js";
import Mailer from "../utils/mailer.util.js";
import Bcrypt from "../utils/bcrypt.util.js";
import User from "../models/user.model.js";
import Admin from "../models/superAdmin.model.js";

import s3Service from '../services/s3Service.js';
import jwt from "jsonwebtoken";

const AuthController = {
  async signUp(req, res) {
    const { email, userName, password } = req.bodyValue;
    const { file } = req;
    console.log("file:", file);
    const existingProfileByEmail = await User.findOne({ email, isDeleted: false });

    if (existingProfileByEmail)
    {
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
      profile: file?.location || ''
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

    return res.status(201).json({ success: true, token, data, message: "Account created successfully!" });
  },
  async superAdminSignIn(req, res) {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email }).select("+password");

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ success: false, message: "Email does not exist." });
    }

    const passwordValid = await Bcrypt.compare(password, user.password);

    if (!passwordValid) {
      console.log("Incorrect password");
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
    const user = await User.findOne({ email, isDeleted: false }).select("+password");

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ success: false, message: "Email does not exist." });
    }

    const passwordValid = await Bcrypt.compare(password, user.password);

    if (!passwordValid) {
      console.log("Incorrect password");
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
};

export default AuthController;
