const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// **1. Like an event**
router.post("/:eventId/like", async (req, res) => {
  try {
    const { visitorId } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Prevent duplicate likes
    if (event.likedBy.includes(visitorId)) {
      return res.status(400).json({ message: "User has already liked this event" });
    }

    event.likes += 1;
    event.likedBy.push(visitorId);
    await event.save();

    res.json({ success: true, likes: event.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// **2. Retrieve likes count**
router.get("/:eventId/likes", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({ likes: event.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
