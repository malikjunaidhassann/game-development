import jwt from "jsonwebtoken";

import config from "../config.js";

// const { jwtSecret, jwtExpiresIn } = config;
const jwtSecret = "secretofjwttttttt";
const jwtExpiresIn = "7d";

const JWT = {
  sign(payload) {
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    return token;
  },

  verify(token) {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  },

  decode(token) {
    const decoded = jwt.decode(token);
    return decoded;
  },
};

export default JWT;
