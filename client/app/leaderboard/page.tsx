"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";

interface Event {
    _id: string;
    title: string;
    likes: number;
    date: string;
    location: string;
}

export default function Leaderboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem("darkMode") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem("darkMode", !darkMode ? "true" : "false");
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("/api/leaderboard");
                if (!response.ok) throw new Error("Failed to fetch leaderboard");

                const data = await response.json();
                setEvents(data);
            } catch (err) {
                setError("Error loading leaderboard. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className={`max-w-3xl mx-auto mt-10 p-6 shadow-lg rounded-lg ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

            <h1 className="text-3xl font-bold text-center mb-5">🏆 Event Leaderboard</h1>

            {loading && <p className="text-center">Loading leaderboard...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <ul className="space-y-4">
                {events.map((event, index) => (
                    <li key={event._id} className={`p-4 border rounded-lg flex flex-col ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-lg">
                                {index + 1}. {event.title}
                            </span>
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full">
                                {event.likes} ❤️
                            </span>
                        </div>
                        <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {event.date} - {event.location}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
