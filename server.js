const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const app = express();
app.use(express.json());

//Initialise Connections
connectDB();
connectRedis();

const PORT = process.env.PORT || 5000;

app.post("/api/vitals", (req, res) => {
  const { bedId, heartRate, spO2, timestamp } = req.body;
  console.log(
    `[Server] Received Data -> ${bedId} | HR: ${heartRate} | SpO2: ${spO2}`,
  );
  res.status(200).json({
    success: true,
    message: "data ingested successfully",
  });
});

app.listen(PORT, () => {
  console.log(`PulseGrid Main Server running on port ${PORT}`);
});
