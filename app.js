/* eslint-disable no-console */
import express from "express";
import "express-async-errors";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import compression from "compression";
import { exec } from "child_process";

import config from "./config.js";
import apiRoutes from "./routes/api.routes.js";
import exceptionHandler from "./middlewares/exception.middleware.js";
import globalExceptionHandler from "./utils/globalErrorHandler.util.js";
import IP from "./utils/ip.util.js";

const app = express();

// Whitelist URLs for CORS
const originWhitelist = ["https://realbdgame.com", "https://payment-backend-dashboard.netlify.app"];

// CORS options configuration
const corsOptions = {
  optionsSuccessStatus: 200,
  origin: (origin, callback) => {
    if (originWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Compression options (commented out settings)
const compressionOptions = {
  threshold: 0,
};

// Resolve file paths for views and static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.set("trust proxy", true);
app.set("view engine", "ejs");
// Uncomment if you use static files and views
// app.use(express.static(path.join(__dirname, "public")));

// Logging and compression middleware
app.use(morgan("dev"));
app.use(compression(compressionOptions));

// Apply CORS middleware
app.use(cors(corsOptions));
app.options("*", cors());

// Body parsing middleware
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Custom response logging middleware
app.use((req, res, next) => {
  const originalJson = res.json;

  res.json = function json(response) {
    const ip = IP.getIP(req);
    if (response?.success === false) console.log({ response, resHeaders: res.getHeaders() });

    originalJson.call(this, response);
  };

  next();
});

// API routes and /open-app endpoint
app.use("/api", apiRoutes);
app.post("/open-app", (req, res) => {
  const { packageName } = req.body;

  exec(
    `adb shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening app: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
      console.log(`App opened: ${stdout}`);
      res.json({ message: "App opened successfully" });
    }
  );
});

// Handle 404 errors
app.use((_req, res) => res.status(404).json({ success: false, message: "Route Not Found" }));

// Global error handling
app.use(exceptionHandler);
globalExceptionHandler();

export default app;
