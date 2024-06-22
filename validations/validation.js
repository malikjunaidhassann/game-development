import Joi from "joi";

// import moment from "moment";

// import config from "../config.";

const types = {
  pattern: "string.pattern.base",
};

const messages = {
  websiteRegex: "must be a valid uri",
  zipCode: "Must be a valid US Zip Code.",
  alpha: "{#label} can only contain letters and spaces",
  password: "{#label} can only contain letters and numbers",
  alphaDescription: "{#label} can only contain letters, numbers, spaces and special characters (’'\".,&-@)",
};
const regex = {
  alpha: /^[A-Za-z ]+$/,
  password: /^[a-zA-Z0-9]+$/,
  description: /^[A-Za-z0-9’'".,&-@ ]+$/,
  zipCode: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
  websiteRegex: /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/,
};

const getAlpha = (max = 56) =>
  Joi.string()
    .max(max)
    .required()
    .trim()
    .pattern(regex.alpha)
    .messages({ [types.pattern]: messages.alpha });

const schema = {
  userName: getAlpha(45),
  boolean: Joi.boolean().required(),
  string: Joi.string().required().trim(),
  email: Joi.string().email().min(5).max(64).required().trim(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  password: Joi.string().min(6).max(30).required(),
  // .pattern(regex.password)
  // .messages({ [types.pattern]: messages.password }),
};

const Validation = {
  auth: {
    signUp: {
      body: Joi.object({
        email: schema.email,
        password: schema.password,
        confirmPassword: schema.confirmPassword,
        userName: schema.userName,
      }),
    },
    signIn: {
      body: Joi.object({
        email: schema.email,
        password: schema.password,
      }),
    },

    forgotPassword: {
      body: Joi.object({
        email: schema.email,
      }),
    },
    resetPassword: {
      body: Joi.object({
        email: schema.email,
        // resetCode: schema.code,
        password: schema.password,
        confirmPassword: schema.confirmPassword,
      }),
    },
    // verifyEmail: {
    //   body: Joi.object({
    //     code: schema.code,
    //   }),
    // },
  },
};

export default Validation;
