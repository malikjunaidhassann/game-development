// const express = require("express");
import express from "express";
// const dotenv = require("dotenv");
import dotenv from "dotenv";
// const morgan = require("morgan");
import morgan from "morgan";
// const bodyParser = require("body-parser");
import bodyParser from "body-parser";
// const cors = require("cors");
import cors from "cors";
// const connectDB = require("./db/connect.db");
import connectDB from "./db/connect.db";
// const userRoutes = require("./routes/user.route");
// import userRoutes from "./routes/user.route";
// const mongoose = require("mongoose");
// import mongoose from "mongoose";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const originWhitelist = "http://localhost:3000/";

const corsOptions = {
  optionsSuccessStatus: 200,
  origin: (origin, callback) => {
    if (originWhitelist.indexOf(origin) !== -1 || !origin) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.options("*", cors());
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error(`Unexpected error: ${err.message}`);
    return res.status(500).json({ error: "An unknown error occurred." });
  }
  next();
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5713;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});
