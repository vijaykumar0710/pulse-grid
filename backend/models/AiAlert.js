const mongoose = require("mongoose");

const AiAlertSchema = new mongoose.Schema({
  bedId: { type: String, required: true },
  heartRate: { type: Number, required: true },
  spO2: { type: Number, required: true },
  status: { type: String, default: "critical" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AiAlert", AiAlertSchema);
