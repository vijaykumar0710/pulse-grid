const mongoose = require("mongoose");

const vitalHistorySchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD" e.g., "2026-05-24"
  hour: { type: Number, required: true }, // 0 se 23 tak (e.g., 14 for 2 PM)
  vitals: [
    {
      minute: { type: Number, required: true }, // 0 se 59 tak
      avg_hr: { type: Number, required: true },
      avg_spo2: { type: Number, required: true },
    },
  ],
});

// Is index se database read karna bohot fast ho jayega
vitalHistorySchema.index({ patient_id: 1, date: 1, hour: 1 }, { unique: true });

module.exports = mongoose.model("VitalHistory", vitalHistorySchema);
