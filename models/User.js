const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // 'password' ki jagah 'passwordHash' jaisa image mein hai
  role: { type: String, enum: ["Nurse", "Doctor"], required: true },
  assigned_room: { type: String }, // Sirf Nurse ke liye
  assigned_ward: { type: String }, // Sirf Doctor ke liye
});

module.exports = mongoose.model("User", userSchema);
