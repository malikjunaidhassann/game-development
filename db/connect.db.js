/* eslint-disable no-console */
import mongoose from "mongoose";
import config from "../config";

const { dbUrl } = config;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(dbUrl);

    console.log("db connected");
  } catch (error) {
    console.log("DB connection failed...", error.message);
    throw error;
  }
};

module.exports = connectDB;
