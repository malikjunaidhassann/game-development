import jwt from "jsonwebtoken";
import config from "../config.js";
import User from "../models/user.model.js";
import Admin from "../models/superAdmin.model.js";

const jwtSecret = config.jwtSecret;

function adminAuthorize(model = "user") {
  console.log("Authorize function called with model:", model);
  return async (req, res, next) => {
    console.log("Middleware executed with model:", model);
    const authHeader = req?.header("Authorization");

    if (!authHeader) {
      return res?.status(401).json({ message: "Access Denied: No Token Provided!" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res?.status(401).json({ message: "Access Denied: Token Malformed!" });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log("Decoded token:", decoded);

      const user = await Admin.findById({ _id: decoded._id });
      console.log("Admin found:", user);

      if (!user) {
        return res?.status(400).json({ message: "No User Found" });
      }

      req[`${model}`] = user;

      return next();
    } catch (err) {
      return res?.status(400).json({ message: err.message });
    }
  };
}

export default adminAuthorize;

// export const adminadminAuthorize = () => adminAuthorize("admin");
