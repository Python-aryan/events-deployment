"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient"; // ✅ CLIENT-SIDE IMPORT

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddEventPage() {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    instagramLink: "",
    category: "",
    color: "",
  });

  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser.email || "Authenticated User");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setMessage("✅ Event submitted successfully!");
        setEventData({ title: "", date: "", time: "", location: "", description: "", instagramLink: "", category: "", color: "" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("❌ Error submitting event.");
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      setMessage("❌ Error submitting event.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return user ? (
    <div className="max-w-lg mx-auto mt-10 p-5">
      <div className="flex justify-end mb-4">
        <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">Logout</Button>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Add New Event</h2>
          {message && <p className="text-center font-semibold mb-4">{message}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="text" name="title" placeholder="Event Title" onChange={handleChange} value={eventData.title} required />
            <Input type="date" name="date" onChange={handleChange} value={eventData.date} required />
            <Input type="time" name="time" onChange={handleChange} value={eventData.time} required />
            <Input type="text" name="location" placeholder="Location" onChange={handleChange} value={eventData.location} required />
            <Textarea name="description" placeholder="Event Description" onChange={handleChange} value={eventData.description} required />
            <Input type="url" name="instagramLink" placeholder="Instagram Post Link" onChange={handleChange} value={eventData.instagramLink} required />
            <Input type="text" name="category" placeholder="Category (e.g., Tech, Music)" onChange={handleChange} value={eventData.category} required />
            <Input type="color" name="color" onChange={handleChange} value={eventData.color} required />

            <Button type="submit">Create Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  ) : null;
}
