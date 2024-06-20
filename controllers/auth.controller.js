import JWT from "../utils/jwt.util.js";
import Nano from "../utils/nano.util.js";
import User from "../models/user.model.js";
import Mailer from "../utils/mailer.util.js";
import Bcrypt from "../utils/bcrypt.util.js";

const AuthController = {
  async signUp(req, res) {
    const { email, phone, firstName, lastName, password } = req.bodyValue;
    const existingProfileByEmail = await User.findOne({ email, isDeleted: false });

    if (existingProfileByEmail)
      return res.status(400).json({ success: false, message: "Email already exists." });

    const emailVerificationCode = Nano.getCode({});
    const hashedPassword = await Bcrypt.getHash({ data: password });
    const chef = await User.create({
      firstName,
      lastName,
      email,
      phone,
      emailVerificationCode,
      password: hashedPassword,
    });

    const token = JWT.sign({ _id: chef._id });
    const data = chef.toObject();
    delete data.password;
    delete data.emailVerificationCode;

    await Mailer.sendVerificationEmail({
      email,
      code: emailVerificationCode,
      name: `${userName}`,
    });

    return res
      .status(201)
      .json({ success: true, token, chef: data, message: "Account created successfully!" });
  },
};
