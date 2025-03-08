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
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
});

// ✅ Prevent OverwriteModelError
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

// Use routes
app.use("/api/events", eventRoutes);
app.use("/api/events", likeRoutes); // Add likes routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
