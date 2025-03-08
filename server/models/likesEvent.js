import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  visitorId: { type: String, required: true }, // Unique identifier from FingerprintJS
}, { timestamps: true });

export default mongoose.model("Like", LikeSchema);
