import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import eventRoutes from "./routes/events.js";
import likeRoutes from "./routes/like.js"; // Import like routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses form data

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Event Schema
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  location: String,
  description: String,
  instagramLink: String,
  category: String,
  color: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, // Store visitor IDs
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      userId: String,  // Firebase user ID
      userName: String, // Display Name
      text: String,
      timestamp: { type: Date, default: Date.now }, // Ensure consistency
    },
  ],
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

// Fetch all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new event
app.post("/api/events", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments
app.get("/api/events/:eventId/comments", async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log("Fetching comments for event:", eventId);

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ comments: event.comments || [] });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment
app.post("/api/events/:eventId/comments", async (req, res) => {
  const { eventId } = req.params;
  const { comment, userId, userName } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.comments.push({ userId, userName, text: comment, timestamp: new Date() });
    await event.save();

    res.json({ message: "Comment added successfully!", eventId, comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Use routes
app.use("/api/events", eventRoutes);
app.use("/api/events", likeRoutes); // ✅ Use a separate route prefix to avoid conflicts

// 📌 Most Famous Events using Time-Weighted Popularity
app.get('/leaderboard', async (req, res) => {
  try {
    const lambda = 0.1; // Decay factor (adjustable)
    const now = new Date();

    const events = await Event.find();

    // Apply time-weighted fame score
    const scoredEvents = events.map(event => {
      const ageInDays = (now - new Date(event.createdAt)) / (1000 * 60 * 60 * 24);
      const fameScore = event.likes * Math.exp(-lambda * ageInDays);
      return { ...event.toObject(), fameScore };
    });

    // Sort by fameScore (highest first)
    scoredEvents.sort((a, b) => b.fameScore - a.fameScore);

    res.json(scoredEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
