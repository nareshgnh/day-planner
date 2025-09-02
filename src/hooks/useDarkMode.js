// src/hooks/useDarkMode.js
import { useState, useEffect } from "react";

/**
 * Custom hook to manage dark mode state and persistence.
 * Reads from localStorage first, then system preference.
 * Updates localStorage and document class on change.
 * @returns {[boolean, function]} A tuple containing the dark mode state (isDarkMode) and a function to toggle it.
 */
export const useDarkMode = (storageKey = "darkMode") => {
  const readInitial = (key) => {
    if (typeof window !== "undefined") {
      // 1. Check localStorage
      const storedMode = localStorage.getItem(key);
      if (storedMode !== null) {
        return storedMode === "true";
      }
      // 2. Check system preference
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    // 3. Default for SSR or environments without window
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState(() => readInitial(storageKey));

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Update localStorage
      localStorage.setItem(storageKey, isDarkMode);
      // Update document class
      const root = window.document.documentElement;
      root.classList.remove(isDarkMode ? "light" : "dark");
      root.classList.add(isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, storageKey]); // Re-run effect when isDarkMode or key changes

  // When the storageKey changes (e.g., user logs in), re-read preference
  useEffect(() => {
    const next = readInitial(storageKey);
    setIsDarkMode(next);
  }, [storageKey]);

  // Function to toggle the mode
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return [isDarkMode, toggleDarkMode];
};
