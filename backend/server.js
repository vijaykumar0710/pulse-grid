const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { connectRedis, redisClient } = require("./config/redis");
const aiQueue = require("./queues/aiQueue");
const authRoutes = require("./routes/authRoutes");
const ChatHistory = require("./models/ChatHistory");
const VitalHistory = require("./models/VitalHistory");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialise Connections
connectDB();
connectRedis();

// ==========================================
// 🔌 SOCKET.IO BLOCK (Chat & Connections)
// ==========================================
io.on("connection", (socket) => {
  console.log(`[Socket 🔌] Client Connected: ${socket.id}`);

  socket.on("join_ward", async (wardName) => {
    socket.join(wardName);
    console.log(`[Chat 💬] User joined room: ${wardName}`);

    try {
      const history = await ChatHistory.find({ ward: wardName })
        .sort({ createdAt: 1 })
        .limit(50);
      socket.emit("chat_history", history);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  });

  socket.on("send_message", async (data) => {
    console.log(`[Chat 💬] Message from ${data.sender}: ${data.text}`);
    try {
      await ChatHistory.create({
        ward: data.ward,
        sender: data.sender,
        role: data.role,
        text: data.text,
        time: data.time,
      });
    } catch (error) {
      console.error("Failed to save message to DB", error);
    }
    io.to(data.ward).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket 🔌] Client Disconnected: ${socket.id}`);
  });
});

// ==========================================
// 📡 REDIS SUBSCRIBER (Live Data & AI Alerts)
// ==========================================
const setupRedisSubscriber = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  // Normal Vitals to Frontend
  await subscriber.subscribe("live_vitals", (message) => {
    io.emit("vitals_update", JSON.parse(message));
  });

  // AI Alerts to  Frontend
  await subscriber.subscribe("alerts", async (message) => {
    const alertData = JSON.parse(message);

    io.emit("red_blink_alert", alertData);
  });
};
setupRedisSubscriber();

// ==========================================
// 🛣️ ROUTES BLOCK
// ==========================================
app.use("/api/auth", authRoutes);

app.post("/api/vitals", async (req, res) => {
  const { bedId, heartRate, spO2, timestamp } = req.body;
  try {
    await redisClient.publish("live_vitals", JSON.stringify(req.body));
    await redisClient.ts.add(`ts:${bedId}:hr`, timestamp, heartRate);
    await redisClient.ts.add(`ts:${bedId}:spo2`, timestamp, spO2);
    await aiQueue.add("check-vitals", req.body);

    res
      .status(200)
      .json({ success: true, message: "Data processed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Issue" });
  }
});

app.get("/api/vitals/history/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await VitalHistory.findOne({ patient_id: patientId });
    res
      .status(200)
      .json({ success: true, data: history ? history.vitals : [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🏥 PulseGrid Main Server running on port ${PORT}`);
});
