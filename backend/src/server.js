import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";

dotenv.config();

const server = http.createServer(app);

// Initialize socket
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Mode: ${process.env.USE_MOCK === "true" ? "MOCK" : "PRODUCTION"}`);
  console.log(`🔌 Socket.io ready for real-time events`);
});
