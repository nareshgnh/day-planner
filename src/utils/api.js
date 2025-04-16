// src/utils/api.js
import {
  GEMINI_API_KEY,
  GEMINI_API_ENDPOINT,
  ACTION_GENERAL_CHAT,
  ACTION_BATCH_ACTIONS,
} from "../constants"; // Assuming constants.js is in the parent directory
import { formatDate, parseDate } from "./helpers"; // Assuming helpers.js is in the same directory

/**
 * Fetches a motivational suggestion from the Gemini API based on current habit status.
 * @param {Array} habits - The user's list of habit objects.
 * @param {Object} habitLog - The user's habit log object.
 * @returns {Promise<string>} A promise that resolves to the suggestion string.
 */
export async function fetchMotivationSuggestion(habits, habitLog) {
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
    console.error("Motivation Suggestion Error: API Key or Endpoint missing.");
    return "AI features disabled. Set VITE_GEMINI_API_KEY in .env";
  }
  const now = new Date();
  const todayStr = formatDate(now);
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeLog = habitLog || {};
  const todaysLog = safeLog[todayStr] || {};

  const activeHabitsToday = safeHabits.filter((h) => {
    try {
      const s = parseDate(h.startDate);
      const e = h.endDate ? parseDate(h.endDate) : null;
      const today = parseDate(todayStr);
      return s && today && today >= s && (!e || today <= e);
    } catch (e) {
      console.warn("Error filtering habit for motivation:", h, e);
      return false;
    }
  });

  const completedToday = activeHabitsToday.filter(
    (h) => todaysLog[h.id] === true
  ).length;
  const missedToday = activeHabitsToday.filter(
    (h) => todaysLog[h.id] === false
  ).length;
  const pendingToday = activeHabitsToday.length - completedToday - missedToday;

  let prompt = `You are a motivational assistant for a Habit Tracker app. The user is viewing their habits. `;
  prompt += `Today (${todayStr}), out of ${activeHabitsToday.length} active habits, ${completedToday} are done, ${missedToday} are missed, and ${pendingToday} are pending. `;
  prompt += `Current time: ${now.toLocaleTimeString()}. `;

  if (pendingToday > 0) {
    prompt += `Encourage the user to complete their remaining habits for today. `;
  } else if (completedToday > 0 && activeHabitsToday.length > 0) {
    prompt += `Congratulate the user on their progress today! `;
  } else if (activeHabitsToday.length === 0) {
    prompt += `There are no habits scheduled for today. Maybe plan for tomorrow? `;
  } else {
    prompt += `Offer some general encouragement about consistency. `;
  }
  prompt += `Provide a short (1-2 sentences) encouraging message based on this context, then a relevant quote on a new line prefixed with 'Quote:'.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 100 },
  };

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorBody = `Status: ${response.status}`;
      try {
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson.error || errorJson);
      } catch (e) {
        /* Ignore */
      }
      console.error("Gemini Motivation API Error:", errorBody);
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();
    const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!suggestionText) {
      console.error("Could not parse suggestion text from response:", data);
      return "Keep building those habits!";
    }
    return suggestionText.trim();
  } catch (error) {
    console.error("Error fetching motivation:", error);
    if (
      error.message.includes("API key not valid") ||
      error.message.includes("400") ||
      error.message.includes("403")
    ) {
      return "AI Suggestion Error: Invalid API Key.";
    }
    if (error.message.includes("Quota exceeded")) {
      return "AI Suggestion Error: API Quota Exceeded.";
    }
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      return "AI Suggestion Error: Network issue.";
    }
    return "Could not get suggestion due to an error.";
  }
}

/**
 * Fetches a chat response from the Gemini API based on context and user message.
 * Parses the response to identify potential actions (add, delete, complete, etc.) or general text.
 * @param {Array} habits - Current habits.
 * @param {Object} habitLog - Current habit log.
 * @param {Array} chatHistory - Recent chat messages.
 * @param {string} userMessage - The user's latest message.
 * @param {string} userName - The user's name.
 * @returns {Promise<Object>} A promise resolving to an object like { text: "...", action: "...", ...otherData }
 */
export async function fetchChatResponse(
  habits,
  habitLog,
  chatHistory,
  userMessage,
  userName
) {
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT)
    return { text: "AI features disabled. Set VITE_GEMINI_API_KEY in .env" };

  const todayStr = formatDate(new Date());
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeHabitLog = habitLog || {};

  // Build the system instruction with current data
  const systemInstruction = `You are ${userName}'s friendly AI assistant in their Habit Tracker app. Be concise and helpful. Use simple Markdown.
  
  Your goal is to help manage habits (both 'good' habits to build and 'bad' habits to break). You can also provide general chat/motivation. Respond ONLY with JSON for actions.
  
  **INSTRUCTIONS:**
  - If asked to list habits (e.g., "what are my habits?"), respond conversationally using the list provided below. Do NOT use JSON for listing.
  - You cannot UPDATE existing habits yet. Inform the user politely.
  - For non-action requests (greetings, questions), respond naturally.
  - For 'bad' habits, marking it 'done' means the user successfully AVOIDED the habit for that day. Marking it 'missed' means they INDULGED in the habit.
  - **If the user asks to add MULTIPLE habits in one request, respond with a single JSON object containing an array of 'add_habit' actions.**
  
  **AVAILABLE HABITS:**
  ${
    safeHabits.length > 0
      ? safeHabits
          .map(
            (h) =>
              `- ${h.title} (${
                h.type === "bad" ? "Break Bad" : "Build Good"
              }) (Starts: ${h.startDate}, Ends: ${h.endDate || "Ongoing"})`
          )
          .join("\n")
      : "- No habits defined."
  }
  
  **TODAY'S (${todayStr}) STATUS:**
  ${
    safeHabits
      .filter((h) => {
        try {
          const s = parseDate(h.startDate);
          const e = h.endDate ? parseDate(h.endDate) : null;
          const today = parseDate(todayStr);
          return s && today && today >= s && (!e || today <= e);
        } catch (e) {
          return false;
        }
      })
      .map((h) => {
        const log = safeHabitLog[todayStr]?.[h.id];
        const statusText =
          log === true
            ? h.type === "bad"
              ? "Avoided"
              : "Done"
            : log === false
            ? h.type === "bad"
              ? "Indulged"
              : "Missed"
            : "Pending";
        return `- ${h.title}: ${statusText}`;
      })
      .join("\n") || "- No habits active today."
  }
  
  **ACTIONS (Respond ONLY with JSON):**
  - ADD SINGLE HABIT: Extract title, type ('good' or 'bad'), optional start date (YYYY-MM-DD), optional end date (YYYY-MM-DD). Default start is today, default type is 'good'. JSON: {"action": "add_habit", "title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}
  - ADD MULTIPLE HABITS: If requested, respond with a single JSON object with a 'batch_actions' action type containing an array of individual 'add_habit' actions. JSON: {"action": "batch_actions", "actions": [{"action": "add_habit", "title": "...", "type": "good" | "bad", ...}, {"action": "add_habit", "title": "...", "type": "good" | "bad", ...}]}
  - DELETE HABIT: Extract exact title. JSON: {"action": "delete_habit", "title": "..."} (Requires confirmation)
  - DELETE ALL HABITS: User must explicitly ask to delete ALL. JSON: {"action": "delete_all_habits"} (Requires confirmation)
  - COMPLETE HABIT FOR DATE: Extract habit title and date (YYYY-MM-DD, defaults to today if unspecified). Status is 'true' (done/avoided) or 'false' (missed/indulged). JSON: {"action": "complete_habit_date", "title": "...", "date": "YYYY-MM-DD", "status": true | false}
  - COMPLETE ALL HABITS TODAY: Mark all habits active today as done/avoided (status: true). JSON: {"action": "complete_all_habits_today"} (Requires confirmation)
  - SUGGEST HABITS: Suggest a mix of good/bad habits if appropriate. JSON: {"action": "suggest_habits", "habits": [{"title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}, ...]} (Requires confirmation)
  
  Respond ONLY with the JSON structure when performing an action. No extra text.
  `;

  // Prepare history for API call
  const historyForAPI = [
    { role: "user", parts: [{ text: systemInstruction }] },
    {
      role: "model",
      parts: [
        {
          text: `Okay, I understand. I'm ready to help ${userName} with habits!`,
        },
      ],
    },
    ...chatHistory.slice(-6).map((msg) => ({
      // Include last 6 messages
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] }, // Add the latest user message
  ];

  const requestBody = {
    contents: historyForAPI,
    generationConfig: { maxOutputTokens: 500 },
    // safetySettings: [...] // Consider adding safety settings
  };

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorBody = `Status: ${response.status}`;
      try {
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson.error || errorJson);
      } catch (e) {
        /* Ignore */
      }
      console.error("Gemini Chat API Error:", errorBody);
      if (response.status === 400 || response.status === 403)
        return { text: "Chat Error: Invalid API Key or configuration." };
      if (response.status === 429)
        return {
          text: "Chat Error: API Quota Exceeded. Please try again later.",
        };
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();

    if (data?.promptFeedback?.blockReason) {
      console.error("Chat response blocked:", data.promptFeedback);
      return {
        text: `Sorry, the response was blocked due to: ${data.promptFeedback.blockReason}.`,
      };
    }

    const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!chatResponseText) {
      console.error("Could not parse chat response text:", data);
      return { text: "Sorry, I couldn't process the AI response." };
    }

    // --- Parsing Logic ---
    let potentialJson = null;
    let responseTextForUser = chatResponseText.trim();

    const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
    const fenceMatch = responseTextForUser.match(jsonFenceRegex);

    try {
      let jsonStringToParse = null;
      if (fenceMatch && fenceMatch[1]) {
        jsonStringToParse = fenceMatch[1].trim();
        responseTextForUser = ""; // Assume fenced JSON is the only intended response
      } else if (
        responseTextForUser.startsWith("{") &&
        responseTextForUser.endsWith("}")
      ) {
        jsonStringToParse = responseTextForUser;
        responseTextForUser = ""; // Assume direct parse means the entire response was JSON
      }

      if (jsonStringToParse) {
        potentialJson = JSON.parse(jsonStringToParse);
      }
    } catch (e) {
      potentialJson = null;
      responseTextForUser = chatResponseText.trim(); // Restore original text on parse failure
      console.log("Response not valid JSON, treating as text.", e);
    }

    // Check if parsed JSON is a recognized action structure
    if (potentialJson) {
      // Batch action
      if (
        potentialJson.action === ACTION_BATCH_ACTIONS &&
        Array.isArray(potentialJson.actions)
      ) {
        if (
          potentialJson.actions.every(
            (item) => item && typeof item === "object" && item.action
          )
        ) {
          return potentialJson;
        } else {
          console.warn(
            "Batch actions object contains invalid inner actions. Treating as text."
          );
          responseTextForUser = chatResponseText.trim();
        }
      }
      // Single action
      else if (typeof potentialJson === "object" && potentialJson.action) {
        const actionData = { ...potentialJson }; // Normalize later in main component
        return actionData;
      } else {
        console.warn(
          "Parsed JSON, but not a recognized action structure. Treating as text."
        );
        responseTextForUser = chatResponseText.trim();
      }
    }

    // Return as general chat if no valid action JSON found
    return { text: responseTextForUser, action: ACTION_GENERAL_CHAT };
  } catch (error) {
    console.error("Error fetching chat response:", error);
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      return { text: "Chat Error: Network issue. Please check connection." };
    }
    return { text: `Sorry, an error occurred while contacting the AI.` };
  }
}
