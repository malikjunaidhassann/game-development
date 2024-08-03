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
    .messages({ [types.pattern]: messages.alpha });

const schema = {
  userName: getAlpha(45),
  boolean: Joi.boolean().required(),
  string: Joi.string().required().trim(),
  email: Joi.string().email().min(5).max(64).required().trim(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Password must match",
  }),
  password: Joi.string().min(6).max(30).required(),
  profilePicture: Joi.any().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
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
        // "profile-image": schema.profilePicture,
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
        resetCode: Joi.string()
          .length(6)
          .pattern(/^[0-9]+$/)
          .required(),
        password: schema.password,
      }),
    },
    verifyEmail: {
      body: Joi.object({
        code: schema.code,
      }),
    },
  },
  table: {
    create: {
      body: Joi.object({
        tableName: Joi.string().required(),
        entryFee: Joi.number().required(),
        reward: Joi.number()
          .required()
          .custom((value, helpers) => {
            if (value < helpers.state.ancestors[0].entryFee) {
              return helpers.message("Reward must be greater than or equal to the entry fee.");
            }
            return value;
          }),
        // image: Joi.string().required(),
      }),
    },
  },
  tournament: {
    create: {
      body: Joi.object({
        name: Joi.string().required(),
        tableId: Joi.number().required(),
        startDate: Joi.number()
          .required()
          .custom((value, helpers) => {
            const now = Date.now();
            if (value < now) {
              return helpers.message("Start date must be in the future.");
            }
            return value;
          }),
        endDate: Joi.number()
          .required()
          .custom((value, helpers) => {
            const { startDate } = helpers.state.ancestors[0];
            if (value < startDate) {
              return helpers.message("End date must be after the start date.");
            }
            return value;
          }),
      }),
    },
  },
  payment: {
    createPayment: {
      body: Joi.object({
        amount: schema.string.required(),
      }),
    },
    updateStatus: {
      body: Joi.object({
        status: Joi.string().required(),
        paymentID: Joi.string().required(),
      }),
    },
    withdrawRequest: {
      body: Joi.object({
        amount: schema.string.required(),
        walletId: schema.string.required(),
        accountHolder: schema.string.required(),
      }),
    },
    withdrawApprove: {
      params: Joi.object({
        userId: schema.string.required(),
      }),
      body: Joi.object({
        withdrawId: schema.string.required(),
        transactionId: schema.string.required(),
        status: Joi.string()
          .valid("completed", "cancelled", "pending")
          .required(),
      }),
    },
  },
  game: {
    startGame: {
      body: Joi.object({
        tableId: Joi.string().required(),
        gameCoins: Joi.string().required(),
      }),
    },
    updateGameStatus: {
      body: Joi.object({
        gameId: Joi.string().required(),
        gameStatus: Joi.string().valid("in-progress", "no-result", "completed").required(),
        gameResult: Joi.object({
          status: Joi.string().valid("win", "lose").required(),
          coins: Joi.string().required(),
        }),
      }),
    },
  },
};

export default Validation;
