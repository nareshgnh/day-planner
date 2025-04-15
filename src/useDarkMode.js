// src/useDarkMode.js
import { useState, useEffect } from "react";

// Helper function to check if dark mode is preferred by the system
function prefersDarkMode() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Helper function to safely get initial state from localStorage or system preference
function getInitialMode() {
  if (typeof window === "undefined") {
    return false; // Default to light mode if window is not available (SSR)
  }
  try {
    const storedPreference = localStorage.getItem("darkModeEnabled");
    if (storedPreference !== null) {
      return storedPreference === "true";
    }
    // If no preference stored, use system preference
    return prefersDarkMode();
  } catch (error) {
    console.error(
      "Error reading dark mode preference from localStorage:",
      error
    );
    // Fallback to system preference or default if error occurs
    return prefersDarkMode();
  }
}

export function useDarkMode() {
  // State to hold the current mode (true for dark, false for light)
  // Initialize state based on localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(getInitialMode);

  // Function to toggle the mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      try {
        // Store the new preference in localStorage
        localStorage.setItem("darkModeEnabled", newMode.toString());
      } catch (error) {
        console.error(
          "Error saving dark mode preference to localStorage:",
          error
        );
      }
      return newMode;
    });
  };

  // Effect to apply/remove the 'dark' class to the root HTML element
  // and update localStorage when the mode changes
  useEffect(() => {
    const root = window.document.documentElement; // Get the <html> element
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]); // Re-run this effect whenever isDarkMode changes

  // Return the current mode state and the toggle function
  return [isDarkMode, toggleDarkMode];
}
