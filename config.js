import dotenv from "dotenv";

dotenv.config();

const dbUrl = (process.env.DB_URL || "")
  .replace("DB_NAME", process.env.DB_NAME)
  .replace("DB_USERNAME", process.env.DB_USERNAME)
  .replace("DB_PASSWORD", process.env.DB_PASSWORD);

const config = {
  dbUrl,

  port: process.env.PORT,
  env: process.env.NODE_ENV,
  characters: process.env.CHARACTERS,
  originWhitelist: process.env.APP_URL,
  
  appUrl: process.env.APP_URL,
  baseUrl: process.env.BASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,

  mailer: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },

  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION
};

export default config;
