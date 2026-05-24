const aiQueue = require("./queues/aiQueue");
const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const { connectRedis, redisClient } = require("./config/redis");

const app = express();
app.use(express.json());

//Initialise Connections
connectDB();
connectRedis();

const PORT = process.env.PORT || 5000;

app.post("/api/vitals", async (req, res) => {
  const { bedId, heartRate, spO2, timestamp } = req.body;
  try {
    await redisClient.publish("ive_vitals", JSON.stringify(req.body));
    await redisClient.ts.add(`ts:${bedId}:hr`, timestamp, heartRate);
    await redisClient.ts.add(`ts:${bedId}:spo2`, timestamp, spO2);
    res.status(200).json({
      success: true,
      message: "data fanned out successfully",
    });
    await aiQueue.add("check-vitals", req.body);
  } catch (error) {
    console.error("Fan-out Error", error);
    res.status(500).json({
      success: false,
      message: "Server Issue",
    });
  }
});

app.listen(PORT, () => {
  console.log(`PulseGrid Main Server running on port ${PORT}`);
});
