"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Calendar, Clock, MapPin, BookmarkPlus, Filter, Link, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { fetchEvents, addEvent } from "../src/api"
import { Heart } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import EventCard from "@/components/EventCard";
import { auth, provider } from "../src/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


// import { EventType } from "react-hook-form"

type EventType = {
  _id: string;  // MongoDB ObjectId is usually a string
  title: String,
  date: String,
  time: String,
  location: String,
  description: String,
  instagramLink: String,
  category: String,
  color: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, // Store visitor IDs
  createdAt: { type: Date },
};

interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

// Sample event data
// const eventsData: Event[] = [
//   {
//     id: 1,
//     title: "Annual Tech Symposium",
//     date: "2025-03-15",
//     time: "10:00 AM - 4:00 PM",
//     location: "  ",
//     description: "Join us for a day of tech talks, workshops, and networking with industry professionals.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Technology",
//     color: "#3b82f6", // blue
//   },
//   {
//     id: 2,
//     title: "Cultural Fest 2025",
//     date: "2025-03-20",
//     time: "5:00 PM - 10:00 PM",
//     location: "College Grounds",
//     description: "A celebration of diverse cultures with music, dance, and food from around the world.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Cultural",
//     color: "#ec4899", // pink
//   },
//   {
//     id: 3,
//     title: "Entrepreneurship Workshop",
//     date: "2025-03-25",
//     time: "2:00 PM - 5:00 PM",
//     location: "Business School, Room 101",
//     description: "Learn how to turn your ideas into successful businesses from experienced entrepreneurs.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Business",
//     color: "#f59e0b", // amber
//   },
//   {
//     id: 4,
//     title: "Sports Tournament Finals",
//     date: "2025-04-05",
//     time: "9:00 AM - 6:00 PM",
//     location: "College Stadium",
//     description: "Cheer for your favorite teams as they compete for the championship title.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Sports",
//     color: "#10b981", // emerald
//   },
//   {
//     id: 5,
//     title: "Science Exhibition",
//     date: "2025-04-10",
//     time: "11:00 AM - 3:00 PM",
//     location: "Science Building",
//     description: "Explore innovative projects and experiments by students from various departments.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Science",
//     color: "#8b5cf6", // violet
//   },
//   {
//     id: 6,
//     title: "Career Fair 2025",
//     date: "2025-04-15",
//     time: "10:00 AM - 4:00 PM",
//     location: "College Gymnasium",
//     description: "Meet recruiters from top companies and explore internship and job opportunities.",
//     image: "/placeholder.svg?height=200&width=400",
//     category: "Career",
//     color: "#ef4444", // red
//   },
// ]


// Utility function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return date.toLocaleDateString("en-US", options);
};


// Categories used for filtering
const categories = ["All", "Technology", "Cultural", "Business", "Sports", "Science", "Career"]

export default function EventsShowcase() {
  // Component state
  const [events, setEvents] = useState<EventType[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [likedEvents, setLikedEvents] = useState<{ [key: string]: boolean }>({});
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const firstCardRef = useRef<null | HTMLLIElement>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false); 0
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [commentStatus, setCommentStatus] = useState("");



  // Fetch events from API or use static data
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");

        const fetchedEvents = await response.json();
        setEvents(fetchedEvents);

        // Extract likes from fetched events
        const initialLikes = fetchedEvents.reduce((acc: { [x: string]: any }, event: { _id: string | number; likes: number }) => {
          acc[event._id] = event.likes || 0;
          return acc;
        }, {} as Record<string, number>);

        setLikes(initialLikes); // Store likes in state
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const id = result.visitorId;
        setVisitorId(id);

        if (events.length === 0) return; // Ensure events are loaded first

        const likedStatuses: { [key: string]: boolean } = {};
        const likeCounts: { [key: string]: number } = {};

        await Promise.all(
          events.map(async (event) => {
            const likeStatus = localStorage.getItem(`liked_${event._id}_${id}`);
            likedStatuses[event._id] = likeStatus === "true";

            try {
              const response = await fetch(`http://localhost:5000/api/events/${event._id}/like`);
              if (response.ok) {
                const data = await response.json();
                likeCounts[event._id] = data.likes;
              }
            } catch (error) {
              console.error(`Error fetching likes for event ${event._id}:`, error);
            }
          })
        );

        setLikedEvents(likedStatuses);
        setLikes(likeCounts);
      } catch (error) {
        console.error("Error loading fingerprint:", error);
      }
    };

    loadEvents().then(loadFingerprint); // Ensure events load first before checking likes
  }, []);



  // Compute filtered events based on category and search query
  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === "All" || ev.category === selectedCategory;
    const matchesQuery =
      searchQuery &&
      (ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && (!searchQuery || matchesQuery);
  });

  // Toggle saved events
  const toggleSaveEvent = (id: string) => {
    setSavedEvents((prev) =>
      prev.includes(id) ? prev.filter((eventId) => eventId !== id) : [...prev, id]
    );
  };

  // Increment local like count (without API)
  const handleLikeEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      console.error("Error: eventId is undefined!");
      return;
    }

    if (!visitorId || likedEvents[eventId]) return; // Prevent duplicate likes

    try {
      console.log("Liking event with ID:", eventId); // Debug log

      const response = await fetch(`http://localhost:5000/api/events/${eventId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes((prevLikes) => ({
          ...prevLikes,
          [eventId]: data.likes, // Update with the new like count
        }));
        setLikedEvents((prevLiked) => ({
          ...prevLiked,
          [eventId]: true,
        }));
        localStorage.setItem(`liked_${eventId}_${visitorId}`, "true");
      } else {
        const errorData = await response.json();
        console.error("Error liking event:", errorData.message);
      }
    } catch (error) {
      console.error("Error liking event:", error);
    }
  };

  // Handle Like Click (with API request)
  const handleLike = async (eventId: string) => {
    if (!visitorId || likedEvents[eventId]) return;

    try {
      const response = await fetch(`/api/events/${eventId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      if (response.ok) {
        const data = await response.json();

        setLikes((prevLikes) => ({
          ...prevLikes,
          [eventId]: data.likes, // Update with database value
        }));

        setLikedEvents((prevLiked) => ({
          ...prevLiked,
          [eventId]: true,
        }));

        localStorage.setItem(`liked_${eventId}_${visitorId}`, "true");
      }
    } catch (error) {
      console.error("Error liking event:", error);
    }
  };

  const handleAddComment = async (eventId: string, commentText: string) => {
    if (!eventId || typeof eventId !== "string") {
      console.error("❌ Invalid eventId:", eventId);
      return;
    }

    let user = auth.currentUser;

    // ✅ Check if the user is logged in, else prompt login
    if (!user) {
      try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;

        // ✅ Restrict login to @vitstudent.ac.in
        if (!user.email?.endsWith("@vitstudent.ac.in")) {
          alert("⚠️ Only VIT students can comment!");
          await signOut(auth); // Logout user if email is not allowed
          return;
        }
      } catch (error) {
        console.error("❌ Error signing in:", error);
        return;
      }
    }

    try {
      console.log("📌 Sending comment to event ID:", eventId);

      const token = await user.getIdToken();

      const response = await fetch(`http://localhost:5000/api/events/${eventId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: eventId, // ✅ Include User ID
          userName: user.displayName, // ✅ Include Username
          text: commentText, // ✅ Include Comment Text
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Comment added successfully:", data);
      // ✅ Clear input field after successful comment
      setNewComment("");
      setCommentStatus("✅ Comment added!");
      setTimeout(() => setCommentStatus(""), 3000);
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  // Fetch comments when "Comments" button is clicked
  const fetchComments = async (eventId: string) => {
    if (!eventId || typeof eventId !== "string") {
      console.error("❌ Invalid eventId:", eventId);
      return;
    }

    try {
      console.log("📌 Fetching comments for event ID:", eventId);

      const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("✅ API Response:", data);

      // ✅ Ensure comments exist in response before setting state
      setComments(data.comments || []);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
    }

    // ✅ Toggle comments visibility
    setShowComments((prev) => !prev);
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div>
            <Link to="/leaderboard">
              <button>🏆 View Leaderboard</button>
            </Link>
          </div>
          <Tabs
            defaultValue="All"
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className={`${showFilters ? "flex" : "hidden"} md:flex w-full md:w-auto overflow-x-auto`}
          >
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="w-full max-w-3xl mx-auto pb-96">
          <ul className="space-y-4 md:space-y-6">
            {filteredEvents.map((event, index) => (
              <motion.li
                key={event._id}
                ref={index === 0 ? firstCardRef : null}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: index * 10, // Creates a stacking effect
                  scale: 1,
                }}
                exit={{ opacity: 0, y: -50 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 50,
                }}
                className="sticky"
                style={{
                  top: `${Math.min(index * 20, 60)}px`, // Stacks each card slightly below the previous one
                  zIndex: 100 + index, // Ensures that the next card is always on top
                }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    zIndex: 100 + index, // Keeps the current card always above previous cards
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 cursor-pointer"
                    style={{ borderColor: event.color }}
                    onDoubleClick={() => handleLikeEvent(event._id)}
                  >
                    <div className="p-4 flex flex-col space-y-3">
                      <Badge className="self-start" style={{ backgroundColor: event.color, color: "white" }}>
                        {event.category}
                      </Badge>
                      <CardHeader className="pb-2">
                        <h3 className="text-xl font-bold tracking-tight">{event.title}</h3>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <p className="text-sm">{event.description}</p>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <a href={event.instagramLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View on Instagram
                        </a>
                        {/* Comments Button */}
                        <Button
                          className="mt-2 bg-gray-200 text-black"
                          onClick={() => {
                            fetchComments(event._id); // Ensure comments are fetched
                            setOpenEventId(event._id); // Track the event for which the modal is open
                            setIsModalOpen(true);
                          }}
                        >
                          💬 Comments
                        </Button>

                      </CardFooter>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Clicked event ID:", event._id); // Debug log
                          handleLikeEvent(event._id);
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                      >
                        ❤️ <span>{likes[event._id] || 0}</span>
                      </button>
                    </div>
                    {/* Comments Modal */}
                    <Dialog open={isModalOpen && openEventId === event._id} onOpenChange={setIsModalOpen}>
                      <DialogContent className="z-[9999] bg-white dark:bg-gray-900 shadow-lg border dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-gray-100">Comments</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                          {comments.length > 0 ? (
                            comments.map((comment, index) => (
                              <div key={index} className="border rounded-lg p-2 shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{comment.userName}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet.</p>
                          )}
                        </div>

                        {/* Comment Input */}
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-grow bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border dark:border-gray-600"
                          />
                          <Button
                            className="dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddComment(openEventId, newComment);
                            }}
                          >
                            Add Comment
                          </Button>
                          {commentStatus && (
                            <p className="text-green-600 text-sm mt-1">{commentStatus}</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No events found matching your criteria.</p>
          <Button
            variant="link"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );

}