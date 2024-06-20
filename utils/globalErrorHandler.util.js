/* eslint-disable no-console */

export default function globalExceptionHandler() {
  process.on("uncaughtException", (ex) => console.log("uncaughtException", ex));
  process.on("unhandledRejection", (rejection) => console.log("uncaughtException", rejection));
}
