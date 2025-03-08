const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  location: String,
  description: String,
  instagramLink: { type: String, required: true },
  category: String,
  color: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, // Store visitor IDs to prevent multiple likes
});

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
