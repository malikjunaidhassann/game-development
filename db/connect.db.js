/* eslint-disable no-console */
import mongoose from "mongoose";
import config from "../config.js";

const { dbUrl } = config;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(
      "mongodb+srv://gameinfodetails:testcheck09916@cluster0.icvr88i.mongodb.net/test?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000, // Increase timeout to 30 seconds
        socketTimeoutMS: 30000, // Increase timeout to 30 seconds
      }
    );

    console.log("db connected");
  } catch (error) {
    console.log("DB connection failed...", error.message);
    throw error;
  }
};

export default connectDB;
