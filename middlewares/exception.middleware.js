/* eslint-disable no-console */

import config from "../config.js";
// import UploadService from "../services/upload.service.js";

const { env } = config;

export default function exceptionHandler(err, req, res, _next) {
  const dev = env === "development";
  const { file = {}, files = {} } = req;
  const { status = 500, statusText = "ERROR", name, stack, message, isOperational } = err;
  const msg = message || isOperational ? message : "Something Went Wrong.";
  const data = { name, status, message: msg, statusText, success: false };

  console.log("exceptionHandler", status, data, file, files, stack);

  if (dev) data.stack = stack;

  if (name === "MulterError") {
    if (data.message === "File too large") data.status = 413;
  }

  //   UploadService.deleteFiles(req);

  return res.status(data.status).json(data);
}
