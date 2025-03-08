import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/event"; // Ensure Event model is correct!

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find({ likes: { $gt: 0 } }) // Only events with likes
            .sort({ likes: -1 }) // Sort by most likes
            .limit(10); // Limit to top 10

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
