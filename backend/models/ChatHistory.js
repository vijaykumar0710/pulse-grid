const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    ward: { type: String, required: true },
    sender: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatHistory", chatSchema);
