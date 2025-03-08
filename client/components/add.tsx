import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Calendar, Clock, MapPin, BookmarkPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "./ui/textarea"

export default function AddEventForm() {
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEventData({ ...eventData, image: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event Data Submitted:", eventData);
    // Later, send this data to the backend API
  };

  return (
    <Card className="max-w-lg mx-auto mt-10 p-5">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Add New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" name="name" placeholder="Event Name" onChange={handleChange} required />
          <Input type="date" name="date" onChange={handleChange} required />
          <Input type="time" name="time" onChange={handleChange} required />
          <Textarea name="description" placeholder="Event Description" onChange={handleChange} required />
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          <Button type="submit">Create Event</Button>
        </form>
      </CardContent>
    </Card>
  );
}
