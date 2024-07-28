import JWT from "../utils/jwt.util.js";
import User from "../models/user.model.js";

function authorize(model = "user") {
  return async (req, res, next) => {
    const status = 401;
    const success = false;
    const token = req.header("Authorization");

    if (!token) return res.status(status).json({ success, message: "No token provided." });

    try {
      const decoded = JWT.verify(token);
      // eslint-disable-next-line no-nested-ternary
      const Model = User;
      const query = { _id: decoded?._id, isDeleted: false };
      const user = await Model.findOne(query);

      if (!user) return res.status(status).json({ success, message: "Invalid token." });

      req[`${model}`] = user;

      return next();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return res.status(status).json({ success, message: `${error.name}: ${error.message}.` });
    }
  };
}

export default authorize;

export const guestAuthorize = () => authorize("guest");
export const adminAuthorize = () => authorize("admin");
