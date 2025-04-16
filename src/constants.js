// src/constants.js

// Action types for API/Chat interactions
export const ACTION_ADD_HABIT = "add_habit";
export const ACTION_DELETE_HABIT = "delete_habit";
export const ACTION_COMPLETE_HABIT_DATE = "complete_habit_date";
export const ACTION_SUGGEST_HABITS = "suggest_habits";
export const ACTION_GENERAL_CHAT = "general_chat";
export const ACTION_DELETE_ALL_HABITS = "delete_all_habits";
export const ACTION_COMPLETE_ALL_HABITS_TODAY = "complete_all_habits_today";
export const ACTION_BATCH_ACTIONS = "batch_actions";

// API Configuration (Consider moving sensitive parts to environment variables)
// WARNING: Storing API keys directly in code is insecure for production.
// Use environment variables (e.g., import.meta.env.VITE_GEMINI_API_KEY with Vite)
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "Gemini API Key not found (VITE_GEMINI_API_KEY). AI features will be disabled. Set this in your .env file for local development."
  );
} else {
  console.log("Gemini API Key found."); // Don't log the key itself!
}

export const GEMINI_API_ENDPOINT = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`
  : "";
