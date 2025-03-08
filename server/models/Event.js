const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },  // ✅ Changed to Date type for better querying
  time: { type: String, required: true }, // ✅ Keeping time as a string for flexibility
  location: { type: String, required: true },
  description: { type: String, required: true },
  instagramLink: { type: String, required: true },
  category: { type: String, required: true },
  color: { type: String, required: true },
  likes: { type: Number, default: 0, min: 0 }, // ✅ Ensures non-negative likes
  likedBy: { type: [String], default: [] }, // ✅ Stores visitor IDs who liked the event
  createdAt: { type: Date, default: Date.now }, // ✅ Correct usage
  comments: [
    {
      userId: { type: String, required: true }, // ✅ Ensures valid Firebase user ID
      userName: { type: String, required: true }, // ✅ Ensures username exists
      text: { type: String, required: true }, // ✅ Ensures non-empty comment
      timestamp: { type: Date, default: Date.now }, // ✅ Correct usage
    },
  ],
});

// ✅ Prevents re-compiling the model in hot-reload environments
module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
