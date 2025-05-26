// src/components/Header.jsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button"; 
import { getGreeting } from "../utils/helpers"; 

export const Header = ({
  userName,
  isDarkMode,
  toggleDarkMode,
  isChatOpen, // Keep for potential responsive logic for dark mode button
}) => {
  const currentDate = new Date();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
           {/* Mobile Menu Toggle will be in App.jsx, this header is now simpler */}
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Habit Tracker AI
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getGreeting()}, {userName}!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="icon"
            className={`text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 h-9 w-9 ${isChatOpen && "hidden lg:inline-flex" // Example of conditional hide based on chat panel (optional)
            }`}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </header>
  );
};