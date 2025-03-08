import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

router.post("/events", async (req, res) => {
  try {
    console.log("📌 Received Form Data:", req.body);

    const { title, date, time, location, description, instagramLink, category, color } = req.body;

    if (!title || !date || !time || !location || !description || !category || !instagramLink) {
      return res.status(400).json({ error: "All fields are required, including the Instagram link." });
    }

    // ✅ Save to MongoDB
    const newEvent = new Event({ title, date, time, location, description, instagramLink, category, color });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("❌ Error saving event:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
