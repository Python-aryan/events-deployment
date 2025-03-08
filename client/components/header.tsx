"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoonIcon, SunIcon, MenuIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import SignOutButton from "@/components/SignOutButton";


export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Check for user preference
    const isDark =
      localStorage.getItem("darkMode") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches

    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("darkMode", "false")
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("darkMode", "true")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Upcoming Events</span>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/leaderboard">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              🏆 View Leaderboard
            </button>
          </Link>
          <Link href="/add" className="text-sm font-medium transition-colors hover:text-primary">
            Add Event
          </Link>
          <div>
            <SignOutButton />
          </div>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <div className="flex flex-col p-4 space-y-3">
              <Link href="/leaderboard">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                  🏆 View Leaderboard
                </button>
              </Link>
              <Link
                href="/add"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Event
              </Link>
              <div>
                <SignOutButton />
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="flex items-center">
                  {isDarkMode ? (
                    <>
                      <SunIcon className="h-4 w-4 mr-2" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-4 w-4 mr-2" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

