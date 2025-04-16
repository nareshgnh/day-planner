// // src/utils/api.js
// import {
//   GEMINI_API_KEY,
//   GEMINI_API_ENDPOINT,
//   ACTION_GENERAL_CHAT,
//   ACTION_BATCH_ACTIONS,
// } from "../constants";
// import { formatDate, parseDate, isHabitScheduledForDate } from "./helpers";

// /**
//  * Fetches a motivational suggestion based on *overall* status (original function).
//  * Consider removing or refactoring if not used elsewhere.
//  */
// export async function fetchMotivationSuggestion(habits, habitLog) {
//   console.warn(
//     "DEPRECATED? Consider using fetchDailyMotivation for specific daily insights."
//   );
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) return "AI features disabled.";
//   return "Keep up the great work on your habits!";
// }

// /**
//  * *** ADDED FUNCTION for Phase 1 ***
//  * Fetches a short, dynamic motivational message based on the current day's progress.
//  * @param {Array} activeHabitsToday - List of habit objects scheduled for today.
//  * @param {Object} todaysLog - The log entries for today (e.g., { habitId1: true, habitId2: 5 }).
//  * @returns {Promise<string>} A promise that resolves to the motivational message string.
//  */
// export async function fetchDailyMotivation(activeHabitsToday, todaysLog) {
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
//     console.error("Daily Motivation Error: API Key or Endpoint missing.");
//     return "Remember to log your habits today!";
//   }
//   if (!Array.isArray(activeHabitsToday)) {
//     console.error("Daily Motivation Error: Invalid activeHabitsToday input");
//     return "Check your habits for today!";
//   }

//   const safeLog = todaysLog || {};
//   let completedCount = 0;
//   let pendingCount = 0;
//   let partialOrMissedCount = 0;

//   activeHabitsToday.forEach((habit) => {
//     const status = safeLog[habit.id];
//     const goal = habit.isMeasurable ? habit.goal : null;
//     if (status === undefined) pendingCount++;
//     else {
//       if (habit.isMeasurable) {
//         if (typeof status === "number" && goal !== null && status >= goal)
//           completedCount++;
//         else partialOrMissedCount++;
//       } else {
//         if (status === true) completedCount++;
//         else partialOrMissedCount++;
//       }
//     }
//   });
//   const totalHabits = activeHabitsToday.length;

//   let prompt = `You are providing a short (1-2 sentences max), encouraging, forward-looking status update for a user in their habit tracker app based *only* on their progress *today*. Be positive and concise. Do not use markdown.

// Today's Status:
// - Total Habits Scheduled: ${totalHabits}
// - Habits Completed / Goal Met: ${completedCount}
// - Habits Pending: ${pendingCount}
// - Habits Missed / Below Goal: ${partialOrMissedCount}

// Generate the motivational message based ONLY on these numbers.`;

//   if (totalHabits === 0)
//     prompt += `
// Example context: No habits scheduled. Message: "No habits scheduled for today. Plan for tomorrow or add a new habit!"`;
//   else if (pendingCount === 0 && totalHabits > 0)
//     prompt += `
// Example context: All habits logged. Message: "Amazing work! All ${totalHabits} habits logged for today. Keep it up!"`;
//   else if (completedCount > 0 && pendingCount > 0)
//     prompt += `
// Example context: Good progress, some pending. Message: "Great progress! ${completedCount} done, ${pendingCount} to go. Finish strong!"`;
//   else if (completedCount === 0 && pendingCount > 0 && partialOrMissedCount > 0)
//     prompt += `
// Example context: Some missed/partial, some pending. Message: "Still time to turn it around! Focus on the ${pendingCount} remaining habits today."`;
//   else if (
//     completedCount === 0 &&
//     pendingCount > 0 &&
//     partialOrMissedCount === 0
//   )
//     prompt += `
// Example context: No progress yet, all pending. Message: "Ready to start? ${pendingCount} habits waiting for you today!"`;
//   else
//     prompt += `
// Example context: Some logged, none pending, but not all completed. Message: "Good effort logging today! Aim for the goals tomorrow!"`; // Added a fallback context

//   const requestBody = {
//     contents: [{ parts: [{ text: prompt }] }],
//     generationConfig: { maxOutputTokens: 80, temperature: 0.7 },
//   };

//   console.log("Sending Daily Motivation Prompt:", prompt); // Debug

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });
//     if (!response.ok) {
//       let eB = `Status: ${response.status}`;
//       try {
//         const eJ = await response.json();
//         eB = JSON.stringify(eJ.error || eJ);
//       } catch (e) {}
//       console.error("Gemini Daily Motivation API Error:", eB);
//       throw new Error(`API fail: ${eB}`);
//     }
//     const data = await response.json();
//     console.log("Gemini Daily Motivation Response:", data); // Debug
//     if (data?.promptFeedback?.blockReason) {
//       console.error("Blocked:", data.promptFeedback);
//       return `Insight blocked. Keep tracking!`;
//     }
//     const messageText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!messageText) {
//       console.error("Could not parse:", data);
//       return "Keep building habits!";
//     }
//     return messageText.trim();
//   } catch (error) {
//     console.error("Error fetching daily motivation:", error);
//     if (error.message.includes("API key not valid"))
//       return "AI Error: Invalid Key.";
//     if (error.message.includes("Quota exceeded")) return "AI Error: Quota.";
//     if (error.message.includes("fetch")) return "AI Error: Network issue.";
//     return "Could not get daily insight.";
//   }
// }

// /**
//  * Fetches a chat response from the Gemini API (existing function - updated prompt).
//  */
// export async function fetchChatResponse(
//   habits,
//   habitLog,
//   chatHistory,
//   userMessage,
//   userName
// ) {
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT)
//     return { text: "AI features disabled. Set VITE_GEMINI_API_KEY in .env" };

//   const todayStr = formatDate(new Date());
//   const safeHabits = Array.isArray(habits) ? habits : [];
//   const safeHabitLog = habitLog || {};

//   // Prompt updated to include latest fields (measurable, schedule, category)
//   const systemInstruction = `You are ${userName}'s friendly AI assistant in their Habit Tracker app. Be concise and helpful. Use simple Markdown.

// Your goal is to help manage habits (both 'good' habits to build and 'bad' habits to break). You can also provide general chat/motivation. Respond ONLY with JSON for actions.

// INSTRUCTIONS:
// - If asked to list habits, respond conversationally using the list below. Do NOT use JSON for listing.
// - You cannot UPDATE existing habits yet (except logging completion/value). Inform the user politely if they ask to change schedule, goal, etc.
// - For non-action requests (greetings, questions), respond naturally.
// - For 'bad' habits, marking it 'done' means the user successfully AVOIDED the habit. Marking it 'missed' means they INDULGED.
// - For measurable habits (e.g., drink water), the user logs a numeric value. 'Done' means they met or exceeded the goal.
// - If the user asks to add MULTIPLE habits, respond with a single JSON object containing an array of 'add_habit' actions.
// - You cannot log values for measurable habits via chat yet. Tell the user to log the value directly on the habit.

// AVAILABLE HABITS:
// ${
//   safeHabits.length > 0
//     ? safeHabits
//         .map((h) => {
//           let details = `- ${h.title} (${
//             h.type === "bad" ? "Break Bad" : "Build Good"
//           })`;
//           if (h.isMeasurable)
//             details += ` [Measurable: Goal ${h.goal || "?"} ${h.unit || ""}]`;
//           const scheduleType = h.scheduleType || "daily";
//           if (scheduleType === "specific_days")
//             details += ` [Schedule: ${
//               h.scheduleDays
//                 ?.map(
//                   (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
//                 )
//                 .join(", ") || "Specific Days"
//             }]`;
//           else if (scheduleType === "frequency_weekly")
//             details += ` [Schedule: ${h.scheduleFrequency || "?"} times/week]`;
//           else details += ` [Schedule: Daily]`;
//           details += ` (Category: ${h.category || "None"})`;
//           return details;
//         })
//         .join("\n")
//     : "- No habits defined."
// }

// TODAY'S (${todayStr}) STATUS:
// ${
//   safeHabits
//     .filter((h) => isHabitScheduledForDate(h, new Date()))
//     .map((h) => {
//       const log = safeHabitLog[todayStr]?.[h.id];
//       let statusText = "Pending";
//       if (h.isMeasurable) {
//         if (typeof log === "number") {
//           statusText =
//             `Logged ${log}${h.unit ? " " + h.unit : ""}` +
//             (h.goal != null && log >= h.goal ? " (Goal Met!)" : "");
//         }
//       } else {
//         if (log === true) statusText = h.type === "bad" ? "Avoided" : "Done";
//         else if (log === false)
//           statusText = h.type === "bad" ? "Indulged" : "Missed";
//       }
//       return `- ${h.title}: ${statusText}`;
//     })
//     .join("\n") || "- No habits scheduled today."
// }

// ACTIONS (Respond ONLY with JSON):
// - ADD SINGLE HABIT: Extract title, type ('good'/'bad'), optional start/end date (YYYY-MM-DD), optional schedule (type, days, freq), optional measurable (isMeasurable, unit, goal), optional category. JSON: {"action": "add_habit", "title": "...", "type": "good"|"bad", "startDate": "...", "endDate": "...", "scheduleType": "daily"|"specific_days"|"frequency_weekly", "scheduleDays": [0-6], "scheduleFrequency": number, "isMeasurable": boolean, "unit": "...", "goal": number, "category": "..."}
// - ADD MULTIPLE HABITS: Use 'batch_actions'. JSON: {"action": "batch_actions", "actions": [{"action":"add_habit", ...}, {...}]}
// - DELETE HABIT: Extract exact title. JSON: {"action": "delete_habit", "title": "..."} (Requires confirmation)
// - DELETE ALL HABITS: User must ask to delete ALL. JSON: {"action": "delete_all_habits"} (Requires confirmation)
// - COMPLETE NON-MEASURABLE HABIT FOR DATE: Extract title and date (defaults to today). Status is true/false. JSON: {"action": "complete_habit_date", "title": "...", "date": "YYYY-MM-DD", "status": true|false}
// - COMPLETE ALL NON-MEASURABLE TODAY: Mark all non-measurable habits scheduled today as done/avoided. JSON: {"action": "complete_all_habits_today"} (Requires confirmation)
// - SUGGEST HABITS: Suggest new habits. JSON: {"action": "suggest_habits", "habits": [{"title": "...", ...}]} (Requires confirmation)

// Respond ONLY with the JSON structure when performing an action. No extra text.
// `;

//   const historyForAPI = [
//     { role: "user", parts: [{ text: systemInstruction }] },
//     {
//       role: "model",
//       parts: [{ text: `Okay, I understand. I'm ready to help ${userName}!` }],
//     },
//     ...chatHistory.slice(-6).map((msg) => ({
//       role: msg.sender === "user" ? "user" : "model",
//       parts: [{ text: msg.text }],
//     })),
//     { role: "user", parts: [{ text: userMessage }] },
//   ];
//   const requestBody = {
//     contents: historyForAPI,
//     generationConfig: { maxOutputTokens: 700 },
//   };

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });
//     if (!response.ok) {
//       let eB = `Status: ${response.status}`;
//       try {
//         const eJ = await response.json();
//         eB = JSON.stringify(eJ.error || eJ);
//       } catch (e) {}
//       console.error("Chat API Err:", eB);
//       if (response.status === 400 || response.status === 403)
//         return { text: "Chat Err: Invalid Key/config." };
//       if (response.status === 429) return { text: "Chat Err: Quota Exceeded." };
//       throw new Error(`API fail: ${eB}`);
//     }
//     const data = await response.json();
//     if (data?.promptFeedback?.blockReason) {
//       console.error("Chat blocked:", data.promptFeedback);
//       return { text: `Blocked: ${data.promptFeedback.blockReason}.` };
//     }
//     const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!chatResponseText) {
//       console.error("Could not parse chat text:", data);
//       return { text: "Sorry, AI response error." };
//     }

//     // Parsing Logic
//     let potentialJson = null;
//     let responseTextForUser = chatResponseText.trim();
//     const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
//     const fenceMatch = responseTextForUser.match(jsonFenceRegex);
//     try {
//       let jsonStringToParse = null;
//       if (fenceMatch && fenceMatch[1]) jsonStringToParse = fenceMatch[1].trim();
//       else if (
//         responseTextForUser.startsWith("{") &&
//         responseTextForUser.endsWith("}")
//       )
//         jsonStringToParse = responseTextForUser;
//       if (jsonStringToParse) {
//         potentialJson = JSON.parse(jsonStringToParse);
//         responseTextForUser = "";
//       }
//     } catch (e) {
//       potentialJson = null;
//       responseTextForUser = chatResponseText.trim();
//       console.log("Response not JSON.");
//     }

//     if (potentialJson) {
//       if (
//         potentialJson.action === ACTION_BATCH_ACTIONS &&
//         Array.isArray(potentialJson.actions)
//       ) {
//         if (
//           potentialJson.actions.every(
//             (i) => i && typeof i === "object" && i.action
//           )
//         )
//           return potentialJson;
//         else console.warn("Bad batch actions.");
//       } else if (typeof potentialJson === "object" && potentialJson.action) {
//         return potentialJson;
//       } else {
//         console.warn("Parsed JSON but no action.");
//       }
//       responseTextForUser = chatResponseText.trim();
//     }

//     return { text: responseTextForUser, action: ACTION_GENERAL_CHAT };
//   } catch (error) {
//     console.error("Error fetching chat response:", error);
//     if (error.message.includes("fetch"))
//       return { text: "Chat Error: Network issue." };
//     return { text: `Sorry, an error occurred contacting the AI.` };
//   }
// }

// src/utils/api.js
import {
  GEMINI_API_KEY,
  GEMINI_API_ENDPOINT,
  ACTION_GENERAL_CHAT,
  ACTION_BATCH_ACTIONS,
} from "../constants";
import { formatDate, parseDate, isHabitScheduledForDate } from "./helpers";

/**
 * Fetches a motivational suggestion based on *overall* status (original function).
 * Consider removing or refactoring if not used elsewhere.
 */
export async function fetchMotivationSuggestion(habits, habitLog) {
  console.warn(
    "DEPRECATED? Consider using fetchDailyMotivation for specific daily insights."
  );
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) return "AI features disabled.";
  // Simplified fallback message as original logic was removed
  return "Keep up the great work on your habits!";
}

/**
 * *** UPDATED FUNCTION ***
 * Fetches a short, dynamic motivational message based on the current day's progress.
 * @param {Array} activeHabitsToday - List of habit objects scheduled for today.
 * @param {Object} todaysLog - The log entries for today (e.g., { habitId1: true, habitId2: 5 }).
 * @param {string} timePeriod - The current time period ('Morning', 'Afternoon', 'Evening').
 * @returns {Promise<string>} A promise that resolves to the motivational message string.
 */
export async function fetchDailyMotivation(
  activeHabitsToday,
  todaysLog,
  timePeriod
) {
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
    console.error("Daily Motivation Error: API Key or Endpoint missing.");
    return "Remember to log your habits today!";
  }
  if (!Array.isArray(activeHabitsToday)) {
    console.error("Daily Motivation Error: Invalid activeHabitsToday input");
    return "Check your habits for today!";
  }

  const safeLog = todaysLog || {};
  let completedCount = 0;
  let pendingCount = 0;
  let partialOrMissedCount = 0;

  activeHabitsToday.forEach((habit) => {
    const status = safeLog[habit.id];
    const goal = habit.isMeasurable ? habit.goal : null;
    const isCompleted = habit.isMeasurable
      ? typeof status === "number" && goal !== null && status >= goal
      : status === true;

    if (status === undefined) {
      pendingCount++;
    } else if (isCompleted) {
      completedCount++;
    } else {
      partialOrMissedCount++;
    }
  });
  const totalHabits = activeHabitsToday.length;

  // *** REVISED PROMPT ***
  const prompt = `You are generating a short (1-3 sentences), engaging, and specific motivational message for a user in their habit tracker app.
Base the message primarily on their habit progress for *today*.
Optionally, include a *short, relevant* motivational quote. Be encouraging and human-like.

INPUT DATA FOR TODAY:
- Total Habits Scheduled: ${totalHabits}
- Habits Completed / Goal Met: ${completedCount}
- Habits Pending: ${pendingCount}
- Habits Missed / Below Goal: ${partialOrMissedCount}
- Current Time Period: ${timePeriod}

INSTRUCTIONS:
- Be positive and concise. Use simple conversational language. Minimal markdown (like italics/bold for emphasis) is okay, but avoid lists/headers.
- Acknowledge *both* completed and remaining habits specifically when applicable (e.g., "Great job on the ${completedCount} completed, just ${pendingCount} more to go!"). Don't just state the numbers, weave them into the encouragement.
- Consider the *Time Period* provided to slightly tailor the tone (e.g., 'Get your day started!' vs. 'Finish the day strong!'), but the habit status is the main focus.
- If adding a quote, make it short, relevant to habits/motivation/perseverance, and format it on a new line like:
  > _"Quote text." - Author_
- If no habits are scheduled, provide a simple message encouraging planning or adding habits.
- If all habits are done, celebrate the accomplishment!
- If some are done and some pending, encourage finishing strong.
- If none are done yet, provide gentle motivation to start.

EXAMPLES (Use these styles):

Context: 5 total, 4 completed, 1 pending, 0 missed, Afternoon
Message: You're on a roll! Only 1 habit left to conquer this afternoon – let's finish strong and make it a perfect 5/5!

Context: 2 total, 0 completed, 2 pending, 0 missed, Evening
Message: Alright! You've got 2 habits on your plate, a manageable start to a productive evening. You've got this!

Context: 5 total, 5 completed, 0 pending, 0 missed, Morning
Message: Incredible ${timePeriod}! You've already crushed all 5 of your habits for today. Amazing start!

Context: 3 total, 0 completed, 1 pending, 2 missed, Evening
Message: It's been a bit tough, but there's still 1 habit left for today. Focus on that one and aim for a fresh start tomorrow!

Context: 0 total
Message: No habits scheduled for today. A perfect time to plan for tomorrow or add a new goal!`;
  // *** END REVISED PROMPT ***

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    // Increased token limit slightly for quotes, adjust if needed
    generationConfig: { maxOutputTokens: 120, temperature: 0.75 },
  };

  console.log("Sending Daily Motivation Prompt (v2):", {
    totalHabits,
    completedCount,
    pendingCount,
    partialOrMissedCount,
    timePeriod,
  }); // Debug

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      let eB = `Status: ${response.status}`;
      try {
        const eJ = await response.json();
        eB = JSON.stringify(eJ.error || eJ);
      } catch (e) {}
      console.error("Gemini Daily Motivation API Error:", eB);
      throw new Error(`API fail: ${eB}`);
    }
    const data = await response.json();
    console.log("Gemini Daily Motivation Response (v2):", data); // Debug
    if (data?.promptFeedback?.blockReason) {
      console.error("Blocked:", data.promptFeedback);
      return `Insight blocked. Keep tracking!`;
    }
    const messageText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!messageText) {
      console.error("Could not parse:", data);
      return "Keep building habits!";
    }
    // Basic cleanup - remove potential leading/trailing whitespace or unnecessary quotes around the whole message
    return messageText.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error fetching daily motivation:", error);
    if (error.message.includes("API key not valid"))
      return "AI Error: Invalid Key.";
    if (error.message.includes("Quota exceeded")) return "AI Error: Quota.";
    if (error.message.includes("fetch")) return "AI Error: Network issue.";
    return "Could not get daily insight.";
  }
}

/**
 * Fetches a chat response from the Gemini API (existing function - updated prompt).
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

  // Prompt definition (ensure this reflects your latest habit structure if changed)
  const systemInstruction = `You are ${userName}'s friendly AI assistant in their Habit Tracker app. Be concise and helpful. Use simple Markdown.

Your goal is to help manage habits (both 'good' habits to build and 'bad' habits to break). You can also provide general chat/motivation. Respond ONLY with JSON for actions.

INSTRUCTIONS:
- If asked to list habits, respond conversationally using the list below. Do NOT use JSON for listing.
- You cannot UPDATE existing habits yet (except logging completion/value). Inform the user politely if they ask to change schedule, goal, etc.
- For non-action requests (greetings, questions), respond naturally.
- For 'bad' habits, marking it 'done' means the user successfully AVOIDED the habit. Marking it 'missed' means they INDULGED.
- For measurable habits (e.g., drink water), the user logs a numeric value. 'Done' means they met or exceeded the goal.
- If the user asks to add MULTIPLE habits, respond with a single JSON object containing an array of 'add_habit' actions within a 'batch_actions' wrapper.
- You cannot log values for measurable habits via chat yet. Tell the user to log the value directly on the habit.

AVAILABLE HABITS:
${
  safeHabits.length > 0
    ? safeHabits
        .map((h) => {
          let details = `- ${h.title} (${
            h.type === "bad" ? "Break Bad" : "Build Good"
          })`;
          if (h.isMeasurable)
            details += ` [Measurable: Goal ${h.goal ?? "?"} ${h.unit || ""}]`; // Use ?? for nullish coalescing
          const scheduleType = h.scheduleType || "daily";
          if (scheduleType === "specific_days")
            details += ` [Schedule: ${
              h.scheduleDays
                ?.map(
                  (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                )
                .join(", ") || "Specific Days"
            }]`;
          else if (scheduleType === "frequency_weekly")
            details += ` [Schedule: ${h.scheduleFrequency ?? "?"} times/week]`;
          // Use ??
          else details += ` [Schedule: Daily]`;
          // Removed category logic: details += ` (Category: ${h.category || 'None'})`;
          return details;
        })
        .join("\\n")
    : "- No habits defined."
}

TODAY'S (${todayStr}) STATUS:
${
  safeHabits
    .filter((h) => isHabitScheduledForDate(h, new Date()))
    .map((h) => {
      const log = safeHabitLog[todayStr]?.[h.id];
      let statusText = "Pending";
      if (h.isMeasurable) {
        if (typeof log === "number") {
          statusText =
            `Logged ${log}${h.unit ? " " + h.unit : ""}` +
            (h.goal != null && log >= h.goal ? " (Goal Met!)" : "");
        }
      } else {
        if (log === true) statusText = h.type === "bad" ? "Avoided" : "Done";
        else if (log === false)
          statusText = h.type === "bad" ? "Indulged" : "Missed";
      }
      return `- ${h.title}: ${statusText}`;
    })
    .join("\\n") || "- No habits scheduled today."
}

ACTIONS (Respond ONLY with JSON):
- ADD SINGLE HABIT: Extract title, type ('good'/'bad'), optional start/end date (YYYY-MM-DD), optional schedule (type, days, freq), optional measurable (isMeasurable, unit, goal). JSON: {"action": "add_habit", "title": "...", "type": "good"|"bad", "startDate": "...", "endDate": "...", "scheduleType": "daily"|"specific_days"|"frequency_weekly", "scheduleDays": [0-6], "scheduleFrequency": number, "isMeasurable": boolean, "unit": "...", "goal": number}
- ADD MULTIPLE HABITS: Use 'batch_actions'. JSON: {"action": "batch_actions", "actions": [{"action":"add_habit", ...}, {...}]}
- DELETE HABIT: Extract exact title. JSON: {"action": "delete_habit", "title": "..."} (Requires confirmation)
- DELETE ALL HABITS: User must ask to delete ALL. JSON: {"action": "delete_all_habits"} (Requires confirmation)
- COMPLETE NON-MEASURABLE HABIT FOR DATE: Extract title and date (defaults to today). Status is true/false. JSON: {"action": "complete_habit_date", "title": "...", "date": "YYYY-MM-DD", "status": true|false}
- COMPLETE ALL NON-MEASURABLE TODAY: Mark all non-measurable habits scheduled today as done/avoided. JSON: {"action": "complete_all_habits_today"} (Requires confirmation)
- SUGGEST HABITS: Suggest new habits. JSON: {"action": "suggest_habits", "habits": [{"title": "...", ...}]} (Requires confirmation)

Respond ONLY with the JSON structure when performing an action. No extra text.
`;

  const historyForAPI = [
    { role: "user", parts: [{ text: systemInstruction }] },
    {
      role: "model",
      parts: [{ text: `Okay, I understand. I'm ready to help ${userName}!` }],
    },
    ...chatHistory.slice(-6).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  const requestBody = {
    contents: historyForAPI,
    generationConfig: { maxOutputTokens: 700 },
  }; // Increased token limit slightly

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      let eB = `Status: ${response.status}`;
      try {
        const eJ = await response.json();
        eB = JSON.stringify(eJ.error || eJ);
      } catch (e) {}
      console.error("Chat API Err:", eB);
      if (response.status === 400 || response.status === 403)
        return { text: "Chat Err: Invalid Key/config." };
      if (response.status === 429) return { text: "Chat Err: Quota Exceeded." };
      throw new Error(`API fail: ${eB}`);
    }
    const data = await response.json();
    if (data?.promptFeedback?.blockReason) {
      console.error("Chat blocked:", data.promptFeedback);
      return { text: `Blocked: ${data.promptFeedback.blockReason}.` };
    }
    const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!chatResponseText) {
      console.error("Could not parse chat text:", data);
      return { text: "Sorry, AI response error." };
    }

    // Parsing Logic (Attempt to find JSON within ```json ... ``` or if the whole response is JSON)
    let potentialJson = null;
    let responseTextForUser = chatResponseText.trim();
    const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
    const fenceMatch = responseTextForUser.match(jsonFenceRegex);
    try {
      let jsonStringToParse = null;
      if (fenceMatch && fenceMatch[1]) {
        jsonStringToParse = fenceMatch[1].trim();
        // If JSON found in fence, assume rest of the text is not for user display unless JSON parsing fails
        responseTextForUser = "";
      } else if (
        responseTextForUser.startsWith("{") &&
        responseTextForUser.endsWith("}")
      ) {
        // Check if the entire response string looks like JSON
        jsonStringToParse = responseTextForUser;
      }

      if (jsonStringToParse) {
        potentialJson = JSON.parse(jsonStringToParse);
        // If parsing succeeds and it was fenced, keep responseText empty.
        // If parsing succeeds and it wasn't fenced, assume the JSON *is* the intended response, clear text.
        responseTextForUser = "";
      }
    } catch (e) {
      // If parsing failed, reset potentialJson and keep the original text for the user.
      potentialJson = null;
      responseTextForUser = chatResponseText.trim(); // Keep original text if JSON parsing fails
      console.log("Response not valid JSON or parsing failed:", e);
    }

    // Validate parsed JSON structure for actions
    if (potentialJson) {
      // Handle batch actions specifically
      if (
        potentialJson.action === ACTION_BATCH_ACTIONS &&
        Array.isArray(potentialJson.actions)
      ) {
        // Basic validation: check if all items in actions array are objects with an 'action' key
        if (
          potentialJson.actions.every(
            (item) => item && typeof item === "object" && item.action
          )
        ) {
          return potentialJson; // Return valid batch action object
        } else {
          console.warn(
            "Parsed batch actions JSON, but action items structure is invalid.",
            potentialJson.actions
          );
          potentialJson = null; // Invalidate JSON if structure is wrong
          responseTextForUser = chatResponseText.trim(); // Revert to showing original text
        }
      }
      // Handle single actions
      else if (typeof potentialJson === "object" && potentialJson.action) {
        return potentialJson; // Return valid single action object
      }
      // If JSON was parsed but doesn't match expected action structure
      else {
        console.warn(
          "Parsed JSON but it doesn't have a valid 'action' property or expected structure."
        );
        potentialJson = null; // Invalidate JSON
        responseTextForUser = chatResponseText.trim(); // Revert to showing original text
      }
    }

    // If no valid JSON action was found, return the text response for general chat
    return { text: responseTextForUser, action: ACTION_GENERAL_CHAT };
  } catch (error) {
    console.error("Error fetching chat response:", error);
    if (error.message.includes("fetch"))
      return { text: "Chat Error: Network issue." };
    return { text: `Sorry, an error occurred contacting the AI.` };
  }
}
