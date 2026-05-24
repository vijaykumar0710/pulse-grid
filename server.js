const express = require("express");
const http = require("http"); 
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const { connectRedis, redisClient } = require("./config/redis");
const aiQueue = require("./queues/aiQueue");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Testing ke liye sabhi origins ko allow kiya
});

// Initialise Connections
connectDB();
connectRedis();

io.on("connection", (socket) => {
  console.log(`[Socket 🔌] New Client Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket 🔌] Client Disconnected: ${socket.id}`);
  });
});

const setupRedisSubscriber = async () => {
  // Subscribe karne ke liye duplicate client banana zaroori hai
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  // Live vitals suno aur frontend ko emit karo
  await subscriber.subscribe("live_vitals", (message) => {
    io.emit("vitals_update", JSON.parse(message));
  });

  // AI Guard ke alerts suno aur frontend ko emit karo
  await subscriber.subscribe("alerts", (message) => {
    io.emit("red_blink_alert", JSON.parse(message));
  });
};
setupRedisSubscriber();

const PORT = process.env.PORT || 5000;

app.post("/api/vitals", async (req, res) => {
  const { bedId, heartRate, spO2, timestamp } = req.body;
  try {
    await redisClient.publish("live_vitals", JSON.stringify(req.body));
    await redisClient.ts.add(`ts:${bedId}:hr`, timestamp, heartRate);
    await redisClient.ts.add(`ts:${bedId}:spo2`, timestamp, spO2);
    await aiQueue.add("check-vitals", req.body);

    res.status(200).json({
      success: true,
      message: "data fanned out successfully",
    });
  } catch (error) {
    console.error("Fan-out Error", error);
    res.status(500).json({
      success: false,
      message: "Server Issue",
    });
  }
});

server.listen(PORT, () => {
  console.log(`PulseGrid Main Server running on port ${PORT}`);
});
