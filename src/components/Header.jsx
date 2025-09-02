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
    <header className="sticky top-0 z-40 w-full bg-[color-mix(in_oKlab,var(--color-surface)_80%,transparent)] backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
            Habit Tracker AI
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[var(--color-text)]/80">
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
            className={`h-9 w-9 text-[var(--color-text)]/80 hover:bg-[var(--color-surface)] ${isChatOpen && "hidden lg:inline-flex"}`}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </header>
  );
};
