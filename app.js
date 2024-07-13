/* eslint-disable no-console */
import express from "express";

import "express-async-errors";

import path from "path";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import compression from "compression";

import config from "./config.js";
import apiRoutes from "./routes/api.routes.js";
import exceptionHandler from "./middlewares/exception.middleware.js";
import globalExceptionHandler from "./utils/globalErrorHandler.util.js";
import IP from "./utils/ip.util.js";

const app = express();

// const { originWhitelist } = config;
const originWhitelist = "https://gamess-dashboard.netlify.app/";

const corsOptions = {
  optionsSuccessStatus: 200,
  origin: (origin, callback) => {
    if (originWhitelist.indexOf(origin) !== -1 || !origin) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
};
const compressionOptions = {
  // level: 9,
  threshold: 0,
  // filter: (req, res) => {
  //   if (req.headers["x-no-compression"]) return false;
  //   return compression.filter(req, res);
  // },
};

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

app.set("trust proxy", true);
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));
app.use(compression(compressionOptions));

app.use(cors(corsOptions));
app.options("*", cors());

app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const originalJson = res.json;

  res.json = function json(response) {
    const ip = IP.getIP(req);
    // const { query, params, body, headers, chef } = req;

    // console.log({ chef: chef?._id, ip, query, params, body, headers });

    if (response?.success === false) console.log({ response, resHeaders: res.getHeaders() });

    originalJson.call(this, response);
  };

  next();
});

app.use("/api", apiRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Route Not Found" }));

app.use(exceptionHandler);

globalExceptionHandler();

export default app;
