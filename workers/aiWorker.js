const { Worker } = require("bullmq");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" }); // Env file load karne ke liye
const { redisClient } = require("../config/redis");
const connectDB = require("../config/db");
const AIAlert = require("../models/AIAlert");
const Patient = require("../models/Patient");

// Worker shuru hone se pehle MongoDB connect karo
connectDB();

console.log(
  "AI Worker is ready, connected to DB, and watching for critical vitals...",
);

const worker = new Worker(
  "ai-vitals-check",
  async (job) => {
    const data = job.data; // data from sensor (e.g., bedId: 'bed_5', spO2: 88)

    // AI Rule: Agar SpO2 90 se kam hai
    if (data.spO2 < 90) {
      console.log(
        `\n🚨 [CRITICAL ALERT] ${data.bedId} - SpO2 Dropped to ${data.spO2}% 🚨`,
      );

      // 1. Alert ko Redis Pub/Sub mein broadcast karo (Frontend blink ke liye)
      const alertMessage = {
        type: "RED_BLINK",
        bedId: data.bedId,
        message: `Oxygen level critical: ${data.spO2}%`,
        timestamp: Date.now(),
      };
      await redisClient.publish("alerts", JSON.stringify(alertMessage));

      // 2. Alert ko MongoDB mein permanently save karo (Cold Storage)
      try {
        // Asli system mein pehle bedId se Patient dhundhte hain
        // Abhi ke liye hum ek dummy ObjectID bana rahe hain taaki schema error na de
        const dummyPatientId = new mongoose.Types.ObjectId();

        await AIAlert.create({
          patient_id: dummyPatientId,
          alert_type: "Hypoxia Risk",
          ai_confidence_score: 0.98,
          description: `Critical alert triggered for ${data.bedId}. SpO2 dropped to ${data.spO2}%.`,
          timestamp: new Date(),
        });
        console.log(`💾 Alert Saved to MongoDB AIAlerts Collection`);
      } catch (dbError) {
        console.error("MongoDB Save Error:", dbError.message);
      }
    } else {
      console.log(`[AI Guard 🟢] ${data.bedId} is stable (SpO2: ${data.spO2})`);
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },
  },
);

worker.on("failed", (job, err) => {
  console.error(`Job failed for ${job.id} with error ${err.message}`);
});
