import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";

const router = express.Router();

// ✅ Create Event
router.post("/", async (req, res) => {
  try {
    console.log("📌 Received Form Data:", req.body);

    const { title, date, time, location, description, instagramLink, category, color } = req.body;

    if (!title || !date || !time || !location || !description || !category || !instagramLink) {
      return res.status(400).json({ error: "All fields are required, including the Instagram link." });
    }

    const newEvent = new Event({ title, date, time, location, description, instagramLink, category, color });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("❌ Error saving event:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add Comment to an Event
router.post("/:eventId/comment", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, userName, text } = req.body;

    if (!userId || !userName || !text) {
      return res.status(400).json({ error: "User ID, username, and comment text are required." });
    }

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID format." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found." });

    event.comments.push({ userId, userName, text, timestamp: new Date() });

    await event.save();
    res.status(200).json({ message: "Comment added", comments: event.comments });
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Single Event with Comments
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID format." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.status(200).json(event);
  } catch (err) {
    console.error("❌ Error fetching event:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
