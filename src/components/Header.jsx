// src/components/Header.jsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button"; // Adjust path as needed
import { getGreeting } from "../utils/helpers"; // Adjust path as needed

export const Header = ({
  userName,
  isDarkMode,
  toggleDarkMode,
  isChatOpen,
}) => {
  const currentDate = new Date(); // Get current date for display

  return (
    // FIX: Reduced vertical padding from py-3 to py-2
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="container mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">
        {" "}
        {/* Changed py-3 to py-2 */}
        {/* App Title */}
        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
          Habit Tracker AI
        </h1>
        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Greeting and Date (Hidden on small screens) */}
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
          {/* Dark Mode Toggle Button */}
          {/* Hide button on small screens if chat is open */}
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="icon"
            className={`text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 h-9 w-9 ${
              isChatOpen ? "hidden lg:inline-flex" : "inline-flex" // Hide on <lg if chat open
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
