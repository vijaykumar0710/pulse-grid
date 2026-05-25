const mongoose = require("mongoose");

const aiAlertSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  alert_type: { type: String, required: true }, // e.g., "Hypoxia Risk"
  ai_confidence_score: { type: Number }, // e.g., 0.95
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Kis nurse/doctor ne action liya
});

module.exports = mongoose.model("AIAlert", aiAlertSchema);
