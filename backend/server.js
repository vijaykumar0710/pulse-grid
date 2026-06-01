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

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ======================
// DB + REDIS
// ======================

connectDB();
connectRedis();

// ======================
// SOCKET.IO
// ======================

io.on("connection", (socket) => {
  console.log(`🔌 Client Connected: ${socket.id}`);

  socket.on("join_ward", async (wardName) => {
    socket.join(wardName);

    try {
      const history = await ChatHistory.find({
        ward: wardName,
      })
        .sort({ createdAt: 1 })
        .limit(50);

      socket.emit("chat_history", history);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      await ChatHistory.create({
        ward: data.ward,
        sender: data.sender,
        role: data.role,
        text: data.text,
        time: data.time,
      });

      io.to(data.ward).emit("receive_message", data);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client Disconnected: ${socket.id}`);
  });
});

// ======================
// REDIS SUBSCRIBER
// ======================

const setupRedisSubscriber = async () => {
  try {
    const subscriber = redisClient.duplicate();

    await subscriber.connect();

    await subscriber.subscribe("live_vitals", (message) => {
      io.emit("vitals_update", JSON.parse(message));
    });

    await subscriber.subscribe("alerts", (message) => {
      const alertData = JSON.parse(message);

      io.emit("red_blink_alert", alertData);
    });

    console.log("✅ Redis Subscriber Running");
  } catch (err) {
    console.error("Redis Subscriber Error:", err);
  }
};

setupRedisSubscriber();

// ======================
// ROUTES
// ======================

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("PulseGrid Backend Running 🚀");
});

app.post("/api/vitals", async (req, res) => {
  try {
    const { bedId, heartRate, spO2, timestamp } = req.body;

    await redisClient.publish("live_vitals", JSON.stringify(req.body));

    // Redis TimeSeries
    try {
      await redisClient.ts.add(`ts:${bedId}:hr`, timestamp, heartRate);

      await redisClient.ts.add(`ts:${bedId}:spo2`, timestamp, spO2);
    } catch (err) {
      console.log("Redis TimeSeries Not Available. Skipping...");
    }

    await aiQueue.add("check-vitals", req.body);

    res.status(200).json({
      success: true,
      message: "Vitals Received",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.get("/api/vitals/history/:patientId", async (req, res) => {
  try {
    const history = await VitalHistory.findOne({
      patient_id: req.params.patientId,
    });

    res.status(200).json({
      success: true,
      data: history ? history.vitals : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 PulseGrid Running on Port ${PORT}`);
});
