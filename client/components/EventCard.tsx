import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type EventType = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  likes: number;
};

type CommentType = {
  userId: string;
  userName: string;
  text: string;
};

export default function EventCard({
  event,
  onLike,
}: {
  event: EventType;
  onLike: (id: string) => void;
}) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isCommentsOpen) {
      async function fetchComments() {
        try {
          setLoading(true);
          const res = await fetch(`/api/events/${event._id}/comments`);
          if (!res.ok) throw new Error("Failed to fetch comments");
          const data = await res.json();
          setComments(data.comments || []);
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setLoading(false);
        }
      }

      fetchComments();
    }
  }, [isCommentsOpen, event._id]);

  // Handle adding comments
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const res = await fetch(`/api/events/${event._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "testUser123", // Replace with actual userId
          userName: "User", // Replace with actual user name
          text: newComment,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setComments((prev) => [...prev, { userId: "testUser123", userName: "User", text: newComment }]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <>
      {/* Event Card */}
      <Card className="w-full max-w-md border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <h3 className="text-xl font-bold">{event.title}</h3>
          <Badge className="mt-1">{event.category}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-700">{event.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" /> <span>{event.location}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center w-full mt-4">
          {/* Like Button */}
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-gray-600 hover:text-red-500"
            onClick={() => onLike(event._id)}
          >
            <Heart className="h-4 w-4" /> {event.likes}
          </Button>

          {/* Comments Button (Opens Modal) */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsCommentsOpen(true)}
          >
            <MessageCircle className="h-4 w-4" /> Comments
          </Button>
        </CardFooter>
      </Card>

      {/* Comments Modal */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          {/* Comment List */}
          <div className="max-h-64 overflow-y-auto space-y-2 p-2 border rounded-md">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="border-b py-1 text-sm">
                  <strong>{comment.userName}:</strong> {comment.text}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            )}
          </div>

          {/* Comment Input */}
          <DialogFooter>
            <div className="flex items-center gap-2 w-full">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow"
              />
              <Button size="sm" onClick={handleAddComment}>
                Post
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
