import "./config/env.js";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { isMockMode } from "./config/env.js";
import { initSocket } from "./socket.js";

const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!isMockMode()) {
    await connectDB();
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Mode: ${isMockMode() ? "MOCK" : "PRODUCTION"}`);
    console.log("Socket.io ready for real-time events");
  });
};

startServer();
