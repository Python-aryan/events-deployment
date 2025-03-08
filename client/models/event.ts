import mongoose, { Schema, Document } from "mongoose";

interface IEvent extends Document {
    title: string;
    likes: number;
}

const EventSchema = new Schema<IEvent>({
    title: { type: String, required: true },
    likes: { type: Number, default: 0 },
});

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
