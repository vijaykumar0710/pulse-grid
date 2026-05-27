const { Worker } = require("bullmq");
const Redis = require("ioredis");
const mongoose = require("mongoose");
require("dotenv").config();

const AiAlert = require("../models/AiAlert");

// Database Connection for Worker
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pulsegrid";
mongoose
  .connect(dbURI)
  .then(() => console.log("🤖 AI Worker: Connected to MongoDB Successfully!"))
  .catch((err) =>
    console.error("❌ AI Worker: MongoDB Connection Error:", err.message),
  );

const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// Worker Logic
const worker = new Worker(
  "check-vitals",
  async (job) => {
    const { bedId, heartRate, spO2, timestamp } = job.data;

    console.log(
      `📥 Worker Checking: ${bedId} | HR: ${heartRate} | SpO2: ${spO2}%`,
    );

    if (spO2 < 90) {
      console.log(
        `🚨 AI Worker: Critical SpO2 detected on ${bedId} -> ${spO2}%`,
      );

      await redisConnection.publish(
        "alerts",
        JSON.stringify({ bedId, spO2, status: "critical" }),
      );

      try {
        await AiAlert.create({
          bedId: bedId,
          heartRate: heartRate,
          spO2: spO2,
          status: "critical",
          timestamp: timestamp || new Date(),
        });
        console.log(`💾 DB Success: Alert saved in MongoDB for ${bedId}`);
      } catch (dbError) {
        console.error("❌ DB Save Error inside Worker:", dbError.message);
      }
    }
  },
  {
    connection: redisConnection,
  },
);

console.log("🤖 AI Worker is running and listening for critical vitals...");
