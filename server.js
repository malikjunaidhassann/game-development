import http from "http";
import dotenv from "dotenv";

import app from "./app.js";
import config from "./config.js";
import connectDB from "./db/connect.db.js";

dotenv.config();

const { port } = config;

app.set("port", port);

const server = http.createServer(app);

server.listen(port, async () => {
  console.log(`Server is listening on PORT ${port}`);
  await connectDB();
});


