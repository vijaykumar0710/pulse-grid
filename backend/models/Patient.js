const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patient_name: { type: String, required: true },
  age: { type: Number, required: true },
  room_number: { type: String, required: true },
  bed_number: { type: Number, required: true },
  medical_history: { type: String },
  status: { type: String, enum: ["Active", "Discharged"], default: "Active" },
  admission_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", patientSchema);
