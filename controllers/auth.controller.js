import JWT from "../utils/jwt.util.js";
import Nano from "../utils/nano.util.js";
import Mailer from "../utils/mailer.util.js";
import Bcrypt from "../utils/bcrypt.util.js";
import User from "../models/user.model.js";

const AuthController = {
  async signUp(req, res) {
    const { email, userName, password } = req.bodyValue;
    const existingProfileByEmail = await User.findOne({ email, isDeleted: false });

    if (existingProfileByEmail)
      return res.status(400).json({ success: false, message: "Email already exists." });

    const emailVerificationCode = Nano.getCode({});
    const hashedPassword = await Bcrypt.getHash({ data: password });
    const chef = await User.create({
      userName,
      email,
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

    return res.status(201).json({ success: true, token, data, message: "Account created successfully!" });
  },
};

export default AuthController;
