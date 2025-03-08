import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin"; // ✅ SERVER-SIDE FIREBASE IMPORT

export async function POST(req: NextRequest) {
  try {
    const eventData = await req.json();
    const eventRef = await firestore.collection("events").add(eventData);
    
    return NextResponse.json({ success: true, id: eventRef.id });
  } catch (error) {
    console.error("Error adding event:", error);
    return NextResponse.json({ success: false, error: "Error adding event" }, { status: 500 });
  }
}
