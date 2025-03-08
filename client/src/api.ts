const API_URL = "http://localhost:5000/api";  // Backend URL

// ✅ Fetch all events
export const fetchEvents = async () => {
  try {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return await res.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// ✅ Add a new event
export const addEvent = async (event: {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
  color: string;
}) => {
  try {
    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error("Failed to add event");
    return await res.json();
  } catch (error) {
    console.error("Error adding event:", error);
  }
};
