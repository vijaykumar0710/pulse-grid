const cron = require("node-cron");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const connectDB = require("../config/db");
const VitalHistory=require("../models/VitalHistory")

connectDB();

console.log("⏱️ Aggregator Worker started. Waiting for cron schedule...");

// Dummy function: Asliyat mein hum Redis TimeSeries se average nikalenge.
// Abhi demonstration ke liye hum har 1 minute mein Bucket Pattern update karenge.
cron.schedule("* * * * *", async () => {
  console.log("🔄 Running Bucket Pattern Aggregation for Vital History...");

  try {
    const dummyPatientId = new mongoose.Types.ObjectId();
    const currentDate = "2026-05-24"; // Aaj ki date
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // 🚀 THE BUCKET PATTERN UPDATE
    // Agar is ghante ka document hai, toh usme minute push karo, warna naya banao
    await VitalHistory.findOneAndUpdate(
      { patient_id: dummyPatientId, date: currentDate, hour: currentHour },
      {
        $push: {
          vitals: {
            minute: currentMinute,
            avg_hr: Math.floor(Math.random() * (100 - 70) + 70), // Dummy Avg HR
            avg_spo2: Math.floor(Math.random() * (100 - 95) + 95), // Dummy Avg SpO2
          },
        },
      },
      { upsert: true, new: true }, // Upsert = Create if not exists
    );

    console.log(`✅ Data bucketed successfully for Minute: ${currentMinute}`);
  } catch (error) {
    console.error("Aggregation Error:", error.message);
  }
});
