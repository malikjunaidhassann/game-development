import jwt from "jsonwebtoken";

import config from "../config.js";
import User from "../models/user.model.js";
const jwtSecret = config.jwtSecret;

const authorize = async (req, res, next) => {
  const authHeader = req?.header("Authorization");

  if (!authHeader) {
    return res
      ?.status(401)
      .json({ message: "Access Denied: No Token Provided!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      ?.status(401)
      .json({ message: "Access Denied: Token Malformed!" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById({ _id: decoded._id, isBlocked: false });

    if (!user) {
      return res?.status(400).json({ message: "No User Found" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res?.status(400).json({ message: err.message });
  }
};

export default authorize;
