const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
  room_number: { type: String, required: true },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
