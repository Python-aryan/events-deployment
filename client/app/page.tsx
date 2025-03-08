import EventsShowcase from "@/components/events-showcase"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
          Upcoming Events
        </h1>
        <p className="text-center mb-10 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Stay updated with all the events happening around campus. Never miss an opportunity to learn,
          network, and have fun!
        </p>
        <EventsShowcase />
      </div>
    </main>
  )
}

