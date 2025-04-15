//version-6

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import ReactMarkdown from "react-markdown";

// --- Calendar Component ---
import Calendar from "react-calendar";
// Base calendar CSS - We'll override parts with Tailwind/custom CSS below
// import 'react-calendar/dist/Calendar.css'; // Keep this commented if using custom styles below

// --- Icons ---
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Brain,
  MessageSquare,
  Send,
  User,
  Bot,
  X,
  Mic,
  MicOff,
  Repeat, // Not used currently, but imported
  Zap, // Not used currently, but imported
  Settings,
  Info,
  AlertTriangle,
  TrendingUp, // Not used currently, but imported
  TrendingDown, // Not used currently, but imported
  ThumbsUp,
  ThumbsDown,
  Sun, // Icon for Light Mode
  Moon, // Icon for Dark Mode
} from "lucide-react";

// --- Dark Mode Hook (Placeholder Implementation) ---
// In a real app, you'd replace this with your actual useDarkMode hook logic
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      // Check localStorage first
      const storedMode = localStorage.getItem("darkMode");
      if (storedMode !== null) {
        return storedMode === "true";
      }
      // Fallback to system preference if no setting stored
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false; // Default to light mode on server or if no preference found
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return [isDarkMode, toggleDarkMode];
};
// --- End Placeholder Dark Mode Hook ---

// --- Hardcoded API Key ---
// WARNING: This is insecure for production. Use environment variables securely.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual key for testing if needed

if (!GEMINI_API_KEY) {
  console.warn(
    "Gemini API Key not found (VITE_GEMINI_API_KEY). AI features will be disabled. Set this in your .env file for local development."
  );
} else {
  console.log("Gemini API Key found."); // Don't log the key itself!
}

const GEMINI_API_ENDPOINT = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`
  : "";

// --- Action Constants ---
const ACTION_ADD_HABIT = "add_habit";
const ACTION_DELETE_HABIT = "delete_habit";
const ACTION_COMPLETE_HABIT_DATE = "complete_habit_date";
const ACTION_SUGGEST_HABITS = "suggest_habits";
const ACTION_GENERAL_CHAT = "general_chat";
const ACTION_DELETE_ALL_HABITS = "delete_all_habits";
const ACTION_COMPLETE_ALL_HABITS_TODAY = "complete_all_habits_today";
const ACTION_BATCH_ACTIONS = "batch_actions"; // New constant for handling multiple actions

// --- Date/Time Helpers ---
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  // Use UTC methods to ensure consistency regardless of local timezone
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const parseDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  // Use Date.UTC to avoid timezone issues when creating/comparing dates
  const date = new Date(Date.UTC(year, month - 1, day));
  // Check if the constructed date is valid (e.g., avoids month 13)
  if (
    isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

// --- Mock shadcn/ui Components (Simplified for portability) ---
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-500 dark:hover:bg-blue-500/90",
    destructive:
      "bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-700 dark:hover:bg-red-700/90",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
    ghost:
      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
const Input = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500 dark:text-gray-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${className}`}
    {...props}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className = "", ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);
const CardTitle = ({ children, className = "", as = "h3", ...props }) => {
  const Tag = as;
  return (
    <Tag
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};
const CardDescription = ({ children, className = "", ...props }) => (
  <p
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </p>
);
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-4 md:p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`flex items-center p-4 md:p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
const DialogContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);
const DialogHeader = ({ children, className = "", ...props }) => (
  <div
    className={`mb-4 border-b border-gray-200 dark:border-gray-800 pb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);
const DialogTitle = ({ children, className = "", as = "h2", ...props }) => {
  const Tag = as;
  return (
    <Tag
      className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};
const DialogFooter = ({ children, className = "", ...props }) => (
  <div
    className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 border-t border-gray-200 dark:border-gray-800 pt-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);
const RadioGroup = ({
  children,
  className = "",
  value,
  onValueChange,
  ...props
}) => (
  // Added value and onValueChange to the props destructuring
  <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
    {/* Clone children to pass down value and onValueChange */}
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          // Pass down checked state and onChange handler based on group's value
          checked: child.props.value === value,
          onChange: (e) => onValueChange(e.target.value),
        });
      }
      return child;
    })}
  </div>
);
const RadioGroupItem = ({
  value,
  id,
  checked, // checked prop is now managed by the parent RadioGroup
  onChange, // onChange prop is now managed by the parent RadioGroup
  className = "",
  ...props
}) => (
  <input
    type="radio"
    id={id}
    value={value}
    checked={checked} // Use the checked prop passed down from RadioGroup
    onChange={onChange} // Use the onChange prop passed down from RadioGroup
    className={`accent-blue-600 dark:accent-blue-500 ${className}`}
    {...props}
  />
);
// --- End Mock Components ---

// --- Helper function to get greeting based on time ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// --- API Call: Motivation Suggestion (Habit Focused) ---
async function fetchMotivationSuggestion(habits, habitLog) {
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
    console.error("Motivation Suggestion Error: API Key or Endpoint missing.");
    return "AI features disabled. Set VITE_GEMINI_API_KEY in .env"; // More informative message
  }
  const now = new Date();
  const todayStr = formatDate(now); // Use UTC-based formatter
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeLog = habitLog || {};
  const todaysLog = safeLog[todayStr] || {};

  const activeHabitsToday = safeHabits.filter((h) => {
    try {
      const s = parseDate(h.startDate);
      const e = h.endDate ? parseDate(h.endDate) : null;
      const today = parseDate(todayStr); // Use UTC-based date for comparison
      // Ensure all dates are valid before comparison
      return s && today && today >= s && (!e || today <= e);
    } catch (e) {
      console.warn("Error filtering habit for motivation:", h, e);
      return false; // Ignore habits with invalid dates during filtering
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

  // console.log("Sending motivation prompt:", prompt); // Reduce console noise

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
        // Ignore if response body is not JSON
      }
      console.error("Gemini Motivation API Error:", errorBody);
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();
    // console.log("Received motivation data:", data); // Reduce console noise

    const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!suggestionText) {
      console.error("Could not parse suggestion text from response:", data);
      return "Keep building those habits!"; // Fallback suggestion
    }

    // console.log("Received motivation suggestion:", suggestionText); // Reduce console noise
    return suggestionText.trim();
  } catch (error) {
    console.error("Error fetching motivation:", error);
    // Provide specific user-friendly errors if possible
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
    return "Could not get suggestion due to an error."; // Generic error
  }
}

// --- API Call: Chat Response (Habit Focused - Updated Actions & Prompt) ---
async function fetchChatResponse(
  habits,
  habitLog,
  chatHistory,
  userMessage,
  userName
) {
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT)
    return { text: "AI features disabled. Set VITE_GEMINI_API_KEY in .env" };

  const todayStr = formatDate(new Date()); // Use UTC-based formatter
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeHabitLog = habitLog || {};

  // --- System Instruction / Persona (Habit Focused) ---
  // ** IMPORTANT: Added instruction for batch actions **
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
        const today = parseDate(todayStr); // Use UTC-based date for comparison
        return s && today && today >= s && (!e || today <= e);
      } catch (e) {
        console.warn("Error filtering habit for chat context:", h, e);
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
- ADD SINGLE HABIT: Extract title, type ('good' or 'bad'), optional start date (YYYY-MM-DD), optional end date (YYYY-MM-DD). Default start is today, default type is 'good'. JSON: {"action": "${ACTION_ADD_HABIT}", "title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}
- ADD MULTIPLE HABITS: If requested, respond with a single JSON object with a 'batch_actions' action type containing an array of individual 'add_habit' actions. JSON: {"action": "${ACTION_BATCH_ACTIONS}", "actions": [{"action": "${ACTION_ADD_HABIT}", "title": "...", "type": "good" | "bad", ...}, {"action": "${ACTION_ADD_HABIT}", "title": "...", "type": "good" | "bad", ...}]}
- DELETE HABIT: Extract exact title. JSON: {"action": "${ACTION_DELETE_HABIT}", "title": "..."} (Requires confirmation)
- DELETE ALL HABITS: User must explicitly ask to delete ALL. JSON: {"action": "${ACTION_DELETE_ALL_HABITS}"} (Requires confirmation)
- COMPLETE HABIT FOR DATE: Extract habit title and date (YYYY-MM-DD, defaults to today if unspecified). Status is 'true' (done/avoided) or 'false' (missed/indulged). JSON: {"action": "${ACTION_COMPLETE_HABIT_DATE}", "title": "...", "date": "YYYY-MM-DD", "status": true | false}
- COMPLETE ALL HABITS TODAY: Mark all habits active today as done/avoided (status: true). JSON: {"action": "${ACTION_COMPLETE_ALL_HABITS_TODAY}"} (Requires confirmation)
- SUGGEST HABITS: Suggest a mix of good/bad habits if appropriate. JSON: {"action": "${ACTION_SUGGEST_HABITS}", "habits": [{"title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}, ...]} (Requires confirmation)

Respond ONLY with the JSON structure when performing an action. No extra text.
`;

  const historyForAPI = [
    { role: "user", parts: [{ text: systemInstruction }] },
    {
      role: "model",
      parts: [{ text: `Okay, I understand. I'm ready to help with habits!` }],
    },
    ...chatHistory.slice(-6).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const requestBody = {
    contents: historyForAPI,
    generationConfig: {
      maxOutputTokens: 500,
      // Ensure JSON output is requested if supported by the specific model version
      // responseMimeType: "application/json", // Uncomment if your model/endpoint supports this
    },
    // safetySettings: [...] // Consider adding safety settings
  };

  // console.log("Sending chat request body (shortened):", { // Reduce console noise
  //   contents: [
  //     { role: "user", parts: [{ text: "System Instruction..." }] },
  //     ...historyForAPI.slice(-2),
  //   ],
  // });

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
        // Ignore if response body is not JSON
      }
      console.error("Gemini Chat API Error:", errorBody);
      if (response.status === 400 || response.status === 403) {
        return { text: "Chat Error: Invalid API Key or configuration." };
      }
      if (response.status === 429) {
        return {
          text: "Chat Error: API Quota Exceeded. Please try again later.",
        };
      }
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();
    // console.log("Received chat data:", data); // Reduce console noise

    // Check for blocked content
    if (data?.promptFeedback?.blockReason) {
      console.error("Chat response blocked:", data.promptFeedback);
      return {
        text: `Sorry, the response was blocked due to: ${
          data.promptFeedback.blockReason
        }. Reason details: ${JSON.stringify(
          data.promptFeedback.safetyRatings
        )}`,
      };
    }

    const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!chatResponseText) {
      console.error("Could not parse chat response text:", data);
      return { text: "Sorry, I couldn't process the AI response." };
    }
    // console.log("Received raw chat response text:", chatResponseText); // Reduce console noise

    // --- Updated Parsing Logic ---
    let potentialJson = null; // Variable to hold parsed JSON
    let responseTextForUser = chatResponseText.trim(); // Default to the full text

    // Try to find JSON within ```json ... ``` fences first
    const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
    const fenceMatch = responseTextForUser.match(jsonFenceRegex);

    try {
      let jsonStringToParse = null;
      if (fenceMatch && fenceMatch[1]) {
        jsonStringToParse = fenceMatch[1].trim();
        // If JSON is found in a fence, assume *only* the JSON is the intended action response.
        // Any text outside the fence might be conversational chatter we can ignore for actions.
        responseTextForUser = ""; // Clear text if fenced JSON is found
        console.log("Found JSON fence.");
      } else if (
        responseTextForUser.startsWith("{") &&
        responseTextForUser.endsWith("}")
      ) {
        // Try parsing directly ONLY if it looks like a complete JSON object
        jsonStringToParse = responseTextForUser;
        responseTextForUser = ""; // Assume direct parse means the entire response was JSON
        console.log("Attempting direct JSON object parse.");
      }

      if (jsonStringToParse) {
        potentialJson = JSON.parse(jsonStringToParse);
        console.log("Successfully parsed JSON:", potentialJson);
      }
    } catch (e) {
      potentialJson = null; // Parsing failed
      responseTextForUser = chatResponseText.trim(); // Restore original text if parsing fails
      console.log(
        "Response is not valid JSON or not wrapped/formatted as expected, treating as text.",
        e
      );
    }

    // Check if the parsed JSON is a recognized action structure
    if (potentialJson) {
      // Check for BATCH action structure
      if (
        typeof potentialJson === "object" &&
        potentialJson.action === ACTION_BATCH_ACTIONS &&
        Array.isArray(potentialJson.actions)
      ) {
        console.log("Parsed response as BATCH actions object.");
        // Basic validation of inner actions
        if (
          potentialJson.actions.every(
            (item) => item && typeof item === "object" && item.action
          )
        ) {
          return potentialJson; // Return the whole batch object
        } else {
          console.warn(
            "Batch actions object contains invalid inner actions. Treating as text."
          );
          // Fallback to text if batch structure is invalid
          responseTextForUser = chatResponseText.trim();
        }
      }
      // Check for SINGLE action object
      else if (typeof potentialJson === "object" && potentialJson.action) {
        console.log("Parsed response as a SINGLE action object.");
        // Normalize properties (ensure they exist, even if null)
        const actionData = {
          ...potentialJson,
          title: potentialJson.title || null,
          habits: potentialJson.habits || null, // For suggest_habits
          startDate: potentialJson.startDate || null,
          endDate: potentialJson.endDate || null,
          date: potentialJson.date || null, // For complete_habit_date
          status: potentialJson.status ?? null, // For complete_habit_date (allow false)
          type: potentialJson.type || "good", // Default for add_habit
        };
        return actionData; // Return the single action object
      } else {
        // Parsed JSON, but not a known action structure
        console.warn(
          "Parsed JSON, but it's not a recognized action structure. Treating as text."
        );
        responseTextForUser = chatResponseText.trim(); // Fallback to text
      }
    }

    // If no valid action JSON was parsed, return as general chat text
    console.log("Returning as general chat text:", responseTextForUser);
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
} // End of fetchChatResponse

// --- Main App Component ---
function App() {
  // --- Use the dark mode hook ---
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  // --- State Definitions ---
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date()); // Use local date for selection display
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitType, setNewHabitType] = useState("good");
  const [newHabitStartDate, setNewHabitStartDate] = useState(
    formatDate(new Date()) // Default to today's date string (UTC)
  );
  const [newHabitEndDate, setNewHabitEndDate] = useState("");
  const [currentDate] = useState(new Date()); // For display purposes (local time)
  const [aiSuggestion, setAiSuggestion] = useState(
    GEMINI_API_KEY ? "Loading suggestion..." : "AI features disabled."
  );
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(
    !!GEMINI_API_KEY
  ); // Start loading if key exists
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const [pendingActionData, setPendingActionData] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [userName, setUserName] = useState("User");
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  // --- Effects ---
  // Load data effect
  useEffect(() => {
    console.log("App Mounted: Loading data.");
    let loadedHabits = [];
    let loadedLog = {};
    let loadedName = "User";
    try {
      const storedHabits = localStorage.getItem("dayPlannerHabits");
      if (storedHabits) {
        try {
          const parsed = JSON.parse(storedHabits);
          if (Array.isArray(parsed)) {
            // Basic validation of loaded habits
            loadedHabits = parsed.filter(
              (h) => h && h.id && h.title && h.startDate
            );
            console.log(
              `Loaded ${loadedHabits.length} valid habits from storage.`
            );
          } else {
            console.warn("Stored habits data is not an array. Clearing.");
            localStorage.removeItem("dayPlannerHabits");
          }
        } catch (e) {
          console.error("Failed to parse stored habits:", e);
          localStorage.removeItem("dayPlannerHabits");
        }
      }
    } catch (e) {
      console.error("Error accessing habits from localStorage:", e);
    }
    try {
      const storedHabitLog = localStorage.getItem("dayPlannerHabitLog");
      if (storedHabitLog) {
        try {
          const parsed = JSON.parse(storedHabitLog);
          if (typeof parsed === "object" && parsed !== null) {
            loadedLog = parsed; // Add validation if needed
            console.log(
              `Loaded habit log for ${Object.keys(loadedLog).length} dates.`
            );
          } else {
            console.warn("Stored habit log data is not an object. Clearing.");
            localStorage.removeItem("dayPlannerHabitLog");
          }
        } catch (e) {
          console.error("Failed to parse stored habit log:", e);
          localStorage.removeItem("dayPlannerHabitLog");
        }
      }
    } catch (e) {
      console.error("Error accessing habit log from localStorage:", e);
    }
    try {
      const storedName = localStorage.getItem("dayPlannerUserName");
      if (storedName) {
        loadedName = storedName; // Add validation if needed
        console.log("Loaded name:", loadedName);
      }
    } catch (e) {
      console.error("Error accessing username from localStorage:", e);
    }
    setHabits(loadedHabits);
    setHabitLog(loadedLog);
    setUserName(loadedName);
    console.log("Initial data loading complete.");
  }, []); // Run only once on mount

  // Save data effects
  useEffect(() => {
    // Save only if habits array is not empty or if there was something previously stored
    if (habits.length > 0 || localStorage.getItem("dayPlannerHabits")) {
      try {
        localStorage.setItem("dayPlannerHabits", JSON.stringify(habits));
        // console.log("Habits saved to localStorage."); // Reduce console noise
      } catch (e) {
        console.error("Save Habit Error:", e);
        // Consider notifying user about storage issue if critical
      }
    } else if (localStorage.getItem("dayPlannerHabits")) {
      // If habits array is empty now, but was previously stored, remove it
      localStorage.removeItem("dayPlannerHabits");
      console.log("Empty habits array, removed from localStorage.");
    }
  }, [habits]);

  useEffect(() => {
    // Save only if log object is not empty or if there was something previously stored
    if (
      Object.keys(habitLog).length > 0 ||
      localStorage.getItem("dayPlannerHabitLog")
    ) {
      try {
        localStorage.setItem("dayPlannerHabitLog", JSON.stringify(habitLog));
        // console.log("Habit log saved to localStorage."); // Reduce console noise
      } catch (e) {
        console.error("Save Log Error:", e);
      }
    } else if (localStorage.getItem("dayPlannerHabitLog")) {
      // If log is empty now, but was previously stored, remove it
      localStorage.removeItem("dayPlannerHabitLog");
      console.log("Empty habit log, removed from localStorage.");
    }
  }, [habitLog]);

  useEffect(() => {
    // Save username if it's not the default "User" value
    if (userName && userName !== "User") {
      try {
        localStorage.setItem("dayPlannerUserName", userName);
        // console.log("Username saved to localStorage."); // Reduce console noise
      } catch (e) {
        console.error("Save Name Error:", e);
      }
    } else if (localStorage.getItem("dayPlannerUserName")) {
      // If username is reset to default, remove it
      localStorage.removeItem("dayPlannerUserName");
      console.log("Default username, removed from localStorage.");
    }
  }, [userName]);

  // Fetch AI Suggestion effect
  useEffect(() => {
    if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
      setAiSuggestion("AI features disabled.");
      setIsLoadingSuggestion(false);
      return;
    }
    // console.log(`App loaded, fetching initial motivation.`); // Reduce noise
    setIsLoadingSuggestion(true);
    setAiSuggestion("Getting suggestion...");
    // Debounce slightly to allow initial render/data load
    const timer = setTimeout(() => {
      fetchMotivationSuggestion(habits, habitLog)
        .then((suggestion) => {
          setAiSuggestion(suggestion || "Could not get suggestion.");
        })
        .catch((error) => {
          console.error("Motivation fetch error in useEffect:", error);
          setAiSuggestion("Failed to get suggestion.");
        })
        .finally(() => {
          setIsLoadingSuggestion(false);
        });
    }, 500); // Increased delay slightly

    return () => clearTimeout(timer); // Cleanup timer on unmount or dependency change
    // Re-fetch suggestion if habits or log changes significantly?
    // For now, only fetch on initial load. Add dependencies [habits, habitLog]
    // if you want it to refresh, but be mindful of API call frequency.
  }, []); // Empty dependency array: fetch only once on initial load

  // Scroll chat effect
  useEffect(() => {
    if (isChatOpen && chatHistory.length > 0) {
      // Use timeout to ensure DOM has updated after adding new message
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // Small delay might be needed
    }
  }, [chatHistory, isChatOpen]); // Trigger on new messages or when chat opens

  // --- Habit Management Callbacks ---
  const closeHabitModal = useCallback(() => {
    console.log("Closing habit modal");
    setIsHabitModalOpen(false);
    setEditingHabit(null);
    // Reset form fields
    setNewHabitTitle("");
    setNewHabitType("good");
    setNewHabitStartDate(formatDate(new Date())); // Reset to today
    setNewHabitEndDate("");
  }, []);

  const upsertHabit = useCallback(
    (habitData) => {
      try {
        // console.log("Upserting habit:", habitData); // Reduce noise
        const newHabit = {
          // Generate a more robust unique ID
          id:
            habitData.id ||
            `habit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          title: (habitData.title || "").trim(),
          type: habitData.type === "bad" ? "bad" : "good",
          startDate: habitData.startDate || formatDate(new Date()), // Default start date (UTC string)
          endDate: habitData.endDate || null, // Store null if empty
        };

        if (!newHabit.title) {
          console.warn("Attempted to add habit without title.");
          alert("Habit title cannot be empty."); // User feedback
          return false; // Indicate failure
        }

        // Validate dates using the reliable parseDate function
        const startD = parseDate(newHabit.startDate);
        const endD = newHabit.endDate ? parseDate(newHabit.endDate) : null;

        if (!startD) {
          alert("Invalid start date format. Please use YYYY-MM-DD.");
          return false; // Indicate failure
        }
        if (newHabit.endDate && !endD) {
          alert(
            "Invalid end date format. Please use YYYY-MM-DD or leave blank."
          );
          return false; // Indicate failure
        }
        if (endD && startD > endD) {
          alert("Habit end date cannot be before the start date.");
          return false; // Indicate failure
        }

        // Prevent adding duplicate titles (case-insensitive check)
        const isDuplicate = habits.some(
          (h) =>
            h.title.toLowerCase() === newHabit.title.toLowerCase() &&
            h.id !== newHabit.id // Allow saving edit with same title
        );
        if (isDuplicate) {
          alert(`Habit with title "${newHabit.title}" already exists.`);
          return false; // Indicate failure
        }

        setHabits((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const existingIndex = safePrev.findIndex((h) => h.id === newHabit.id);
          let updatedHabits;
          if (existingIndex > -1) {
            // Update existing
            updatedHabits = [
              ...safePrev.slice(0, existingIndex),
              newHabit,
              ...safePrev.slice(existingIndex + 1),
            ];
          } else {
            // Add new
            updatedHabits = [...safePrev, newHabit];
          }
          // Sort habits alphabetically by title after adding/updating
          updatedHabits.sort((a, b) => a.title.localeCompare(b.title));
          console.log("Habits state updated count:", updatedHabits.length);
          return updatedHabits;
        });
        return true; // Indicate success
      } catch (e) {
        console.error("Upsert Habit Error:", e);
        alert("An unexpected error occurred while saving the habit.");
        return false; // Indicate failure
      }
    },
    [habits] // Dependency: habits (for duplicate check)
  );

  const handleHabitModalSave = useCallback(() => {
    // console.log("Handling habit modal save"); // Reduce noise
    if (!newHabitTitle.trim()) {
      alert("Habit title required.");
      return;
    }
    const success = upsertHabit({
      id: editingHabit?.id, // Pass ID if editing
      title: newHabitTitle,
      type: newHabitType,
      startDate: newHabitStartDate,
      endDate: newHabitEndDate || null, // Ensure null if empty string
    });

    if (success) {
      closeHabitModal(); // Close modal only on successful save
    }
  }, [
    upsertHabit,
    editingHabit,
    newHabitTitle,
    newHabitType,
    newHabitStartDate,
    newHabitEndDate,
    closeHabitModal,
  ]);

  const findHabitIdByTitle = useCallback(
    (title) => {
      if (!title || !Array.isArray(habits)) return null;
      const searchTerm = title.trim().toLowerCase();
      if (!searchTerm) return null;

      // Prioritize exact match (case-insensitive)
      const exactMatch = habits.find(
        (h) => h.title.trim().toLowerCase() === searchTerm
      );
      if (exactMatch) {
        // console.log(`Found exact habit match: ${exactMatch.id}`); // Reduce noise
        return exactMatch.id;
      }

      console.log(`Habit not found by title: "${title}"`);
      return null;
    },
    [habits] // Dependency: habits
  );

  const handleDeleteHabitCallback = useCallback(
    (id) => {
      try {
        if (!id) return;
        const habitToDelete = habits.find((h) => h.id === id);
        if (!habitToDelete) {
          console.warn(`Habit with ID ${id} not found for deletion.`);
          return;
        }

        console.log(`Deleting habit: ${habitToDelete.title} (ID: ${id})`);

        // Update habits state
        setHabits((prev) =>
          (Array.isArray(prev) ? prev : []).filter((h) => h.id !== id)
        );

        // Update habit log state (remove entries for this habit)
        setHabitLog((prevLog) => {
          const newLog = { ...(prevLog || {}) };
          let logUpdated = false;
          Object.keys(newLog).forEach((date) => {
            if (newLog[date]?.[id] !== undefined) {
              delete newLog[date][id];
              logUpdated = true;
              // If the log for that date becomes empty, remove the date entry
              if (Object.keys(newLog[date]).length === 0) {
                delete newLog[date];
              }
            }
          });
          if (logUpdated) {
            console.log(
              `Habit log updated after deleting habit ${id}. New log size: ${
                Object.keys(newLog).length
              }`
            );
          }
          return newLog;
        });
      } catch (e) {
        console.error("Delete Habit Error:", e);
        alert("An error occurred while deleting the habit.");
      }
    },
    [habits, setHabits, setHabitLog] // Dependencies
  );

  const openModalForEditHabit = useCallback((habit) => {
    console.log("Opening habit modal for edit:", habit);
    setEditingHabit(habit);
    setNewHabitTitle(habit.title);
    setNewHabitType(habit.type || "good");
    setNewHabitStartDate(habit.startDate);
    setNewHabitEndDate(habit.endDate || "");
    setIsHabitModalOpen(true);
  }, []); // No dependencies needed

  const openModalForNewHabit = useCallback(() => {
    console.log("Opening habit modal for new");
    setEditingHabit(null);
    setNewHabitTitle("");
    setNewHabitType("good");
    setNewHabitStartDate(formatDate(new Date())); // Default to today's UTC string
    setNewHabitEndDate("");
    setIsHabitModalOpen(true);
  }, []); // No dependencies needed

  const setHabitCompletionStatus = useCallback(
    (habitId, date, desiredStatus) => {
      // `date` should be a Date object
      try {
        const dateStr = formatDate(date); // Convert Date object to YYYY-MM-DD string (UTC)
        if (!dateStr || !habitId) {
          console.warn(
            "Invalid date or habitId for setting status:",
            date,
            habitId
          );
          return;
        }
        const habitInfo = habits.find((h) => h.id === habitId);
        if (!habitInfo) {
          console.warn(`Habit ${habitId} not found when setting status.`);
          return;
        }

        // console.log( // Reduce noise
        //   `Setting habit ${habitId} (${habitInfo.title}) for ${dateStr} to ${desiredStatus}`
        // );

        setHabitLog((prevLog) => {
          const safePrevLog = prevLog || {};
          const dayLog = { ...(safePrevLog[dateStr] || {}) };
          const currentStatus = dayLog[habitId];

          // Toggle logic: if clicking the same status, unset it (back to pending)
          if (currentStatus === desiredStatus) {
            delete dayLog[habitId];
            // console.log(`Unset habit ${habitId} for ${dateStr}`); // Reduce noise
          } else {
            dayLog[habitId] = desiredStatus;
            // console.log( // Reduce noise
            //   `Set habit ${habitId} for ${dateStr} to ${desiredStatus}`
            // );
          }

          // Create the new log state
          const newLog = { ...safePrevLog };
          if (Object.keys(dayLog).length === 0) {
            // If the day's log is now empty, remove the date key
            delete newLog[dateStr];
          } else {
            // Otherwise, update the log for the date
            newLog[dateStr] = dayLog;
          }

          // console.log("Habit log updated count:", Object.keys(newLog).length); // Reduce noise
          return newLog;
        });
      } catch (e) {
        console.error("Set Habit Status Error:", e);
        alert("An error occurred while updating the habit status.");
      }
    },
    [habits, setHabitLog] // Dependency on habits to find habit info
  );

  // --- Function to close chat (used by button and auto-close logic) ---
  const toggleChat = useCallback(() => {
    console.log("Toggling chat visibility");
    setIsChatOpen((prev) => !prev);
    // If opening chat, focus the input field after transition
    if (!isChatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 350); // Delay matches transition duration
    }
  }, [isChatOpen]); // Dependency: isChatOpen

  // --- Chat Handling ---
  const handleSendChatMessage = useCallback(async () => {
    const messageText = chatInput.trim();
    const lowerCaseMessage = messageText.toLowerCase(); // For farewell check
    // console.log( // Reduce noise
    //   `handleSendChatMessage called. Message: "${messageText}", Awaiting: ${awaitingConfirmation}`
    // );

    if (!messageText && !awaitingConfirmation) {
      // console.log("No message and not awaiting confirmation."); // Reduce noise
      return;
    }
    if (isChatLoading && !awaitingConfirmation) {
      // Allow sending confirmation even if loading previous req
      console.log("Chat is already loading a non-confirmation request.");
      return;
    }

    const newUserMessage = { sender: "user", text: messageText };

    // --- Confirmation Flow ---
    if (awaitingConfirmation && pendingActionData) {
      console.log("Processing confirmation...");
      try {
        // Add user's confirmation message (yes/no) to history immediately
        setChatHistory((prev) => [...prev, newUserMessage]);
        setChatInput(""); // Clear input after sending confirmation

        const userConfirmation = lowerCaseMessage; // Use lower case
        let confirmationResponseText = ""; // Bot's response after confirmation
        let performAction = false;

        if (userConfirmation === "yes" || userConfirmation === "y") {
          performAction = true;
        } else if (userConfirmation === "no" || userConfirmation === "n") {
          confirmationResponseText = "Okay, action cancelled.";
        } else {
          // Invalid confirmation, re-prompt
          confirmationResponseText = `Please confirm with 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;
        }

        if (performAction) {
          try {
            console.log(
              "Performing confirmed action:",
              pendingActionData.action
            );
            // --- Perform the actual action based on pendingActionData ---
            switch (pendingActionData.action) {
              case ACTION_DELETE_HABIT:
                // Use the habit ID(s) stored in pendingActionData
                pendingActionData.habitIds?.forEach((id) =>
                  handleDeleteHabitCallback(id)
                );
                // Use the title stored in pendingActionData for the message
                confirmationResponseText = `Okay, deleted habit "${pendingActionData.title}".`;
                break;

              case ACTION_SUGGEST_HABITS:
                let addedCount = 0;
                pendingActionData.habits?.forEach((h) => {
                  if (upsertHabit(h)) {
                    // Use upsertHabit which returns true on success
                    addedCount++;
                  }
                });
                confirmationResponseText = `Okay, added ${addedCount} suggested habit(s).`;
                break;

              case ACTION_DELETE_ALL_HABITS:
                console.log("Deleting all habits confirmed.");
                setHabits([]); // Clear habits array
                setHabitLog({}); // Clear habit log
                confirmationResponseText = "Okay, deleted all habits and logs.";
                break;

              case ACTION_COMPLETE_ALL_HABITS_TODAY:
                console.log("Completing all habits for today confirmed.");
                const today = new Date(); // Use local date for intent, will be formatted to UTC string
                const todayStr = formatDate(today); // Get today's UTC string
                const activeHabitsToday = (
                  Array.isArray(habits) ? habits : []
                ).filter((h) => {
                  if (!h || !h.startDate) return false;
                  try {
                    const s = parseDate(h.startDate);
                    const e = h.endDate ? parseDate(h.endDate) : null;
                    const todayParsed = parseDate(todayStr); // Use parsed UTC date
                    if (!s || !todayParsed) return false;
                    if (h.endDate && !e) return false; // Invalid end date
                    return todayParsed >= s && (!e || todayParsed <= e);
                  } catch (filterError) {
                    console.error(
                      "Error filtering habit in COMPLETE_ALL:",
                      h,
                      filterError
                    );
                    return false;
                  }
                });

                const activeHabitsTodayIds = activeHabitsToday.map((h) => h.id);

                if (activeHabitsTodayIds.length > 0) {
                  activeHabitsTodayIds.forEach((id) =>
                    // Pass the Date object to the function
                    setHabitCompletionStatus(id, today, true)
                  );
                  confirmationResponseText = `Okay, marked all ${activeHabitsTodayIds.length} active habits for today as complete/avoided.`;
                } else {
                  confirmationResponseText =
                    "No habits were active today to mark as complete.";
                }
                break;

              default:
                confirmationResponseText = "Action confirmed (unknown type).";
                console.warn(
                  "Confirmed unknown action type:",
                  pendingActionData.action
                );
            }
            // Action completed successfully
          } catch (error) {
            console.error("Error performing confirmed action:", error);
            confirmationResponseText =
              "Sorry, there was an error performing the action.";
          }
        }

        // Add the bot's confirmation response message
        if (confirmationResponseText) {
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: confirmationResponseText },
          ]);
        }

        // Reset confirmation state ONLY if action was performed or explicitly cancelled
        if (
          performAction ||
          userConfirmation === "no" ||
          userConfirmation === "n"
        ) {
          setPendingActionData(null);
          setAwaitingConfirmation(false);
          console.log("Confirmation state reset.");
        } else {
          console.log("Awaiting valid confirmation (yes/no).");
          // Keep awaiting confirmation if input was invalid
        }
      } catch (error) {
        console.error("Error during confirmation flow:", error);
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "An error occurred during confirmation." },
        ]);
        // Reset state on error
        setPendingActionData(null);
        setAwaitingConfirmation(false);
      } finally {
        // Refocus input after processing confirmation attempt
        setTimeout(() => chatInputRef.current?.focus(), 0);
      }
      return; // Stop execution here for confirmation flow
    }

    // --- Regular Chat / New Action Request ---
    // console.log("Processing new chat message..."); // Reduce noise
    setIsChatLoading(true);
    // Add user message immediately
    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput(""); // Clear input after sending

    try {
      // Pass the latest history including the new user message
      const currentChatHistory = [...chatHistory, newUserMessage];
      // console.log("Calling fetchChatResponse..."); // Reduce noise
      const botResponse = await fetchChatResponse(
        habits,
        habitLog,
        currentChatHistory, // Pass updated history
        messageText,
        userName
      );
      // console.log("Received bot response object:", botResponse); // Reduce noise

      let requiresConfirmation = false;
      let confirmationPrompt = "";
      let chatMessageToAdd = ""; // Bot's message to display (can be action result, prompt, or text)
      let actionDataForConfirmation = null; // Data needed if confirmation is required

      if (!botResponse || (!botResponse.action && !botResponse.text)) {
        console.error("Invalid or empty bot response received:", botResponse);
        chatMessageToAdd = "Sorry, I received an invalid response from the AI.";
        // Don't throw error here, just set the message
      } else if (
        botResponse.action &&
        botResponse.action !== ACTION_GENERAL_CHAT
      ) {
        // --- Process Single or Batch Actions ---
        // console.log(`Processing action: ${botResponse.action}`); // Reduce noise
        actionDataForConfirmation = {
          // Initialize for potential confirmation
          action: botResponse.action,
          confirmationPrompt: "",
        };

        try {
          switch (botResponse.action) {
            // --- Case: ADD SINGLE HABIT ---
            case ACTION_ADD_HABIT:
              if (
                upsertHabit({
                  // Call upsertHabit and check success
                  title: botResponse.title,
                  type: botResponse.type,
                  startDate: botResponse.startDate,
                  endDate: botResponse.endDate,
                })
              ) {
                chatMessageToAdd = `Okay, added habit "${botResponse.title}".`;
              } else {
                // upsertHabit already showed an alert on failure
                chatMessageToAdd = `Could not add habit "${botResponse.title}". It might be a duplicate or have invalid dates.`;
              }
              break;

            // --- Case: BATCH ACTIONS (Currently only Add) ---
            case ACTION_BATCH_ACTIONS:
              if (Array.isArray(botResponse.actions)) {
                console.log(
                  `Processing ${botResponse.actions.length} batch actions.`
                );
                let addedCount = 0;
                let failedTitles = [];
                let duplicateTitles = [];

                botResponse.actions.forEach((action) => {
                  // Currently only handling batched ADD_HABIT
                  if (action.action === ACTION_ADD_HABIT && action.title) {
                    // Check for duplicates *before* attempting upsert
                    const isDuplicate = habits.some(
                      (h) =>
                        h.title.toLowerCase() === action.title.toLowerCase()
                    );
                    if (isDuplicate) {
                      duplicateTitles.push(action.title);
                    } else if (
                      upsertHabit({
                        // Attempt to add if not duplicate
                        title: action.title,
                        type: action.type || "good",
                        startDate: action.startDate,
                        endDate: action.endDate,
                      })
                    ) {
                      addedCount++;
                    } else {
                      failedTitles.push(action.title); // Failed for reasons other than duplicate (e.g., invalid date)
                    }
                  } else {
                    console.warn(
                      "Unsupported or invalid action in batch:",
                      action
                    );
                    if (action.title) failedTitles.push(action.title);
                  }
                });

                // Construct batch response message
                let messages = [];
                if (addedCount > 0)
                  messages.push(`Added ${addedCount} habits.`);
                if (duplicateTitles.length > 0)
                  messages.push(
                    `Skipped duplicates: ${duplicateTitles.join(", ")}.`
                  );
                if (failedTitles.length > 0)
                  messages.push(
                    `Failed to add (invalid data?): ${failedTitles.join(", ")}.`
                  );

                if (messages.length > 0) {
                  chatMessageToAdd = messages.join(" ");
                } else if (botResponse.actions.length > 0) {
                  chatMessageToAdd =
                    "Sorry, couldn't process the requested habit additions.";
                } else {
                  chatMessageToAdd = "Received an empty batch action request.";
                }
              } else {
                chatMessageToAdd =
                  "Received batch action request but actions array is missing or invalid.";
                console.warn("Invalid batch_actions structure:", botResponse);
              }
              break; // End of batch actions case

            // --- Case: DELETE HABIT ---
            case ACTION_DELETE_HABIT:
              const habitIdToDelete = findHabitIdByTitle(botResponse.title);
              if (habitIdToDelete) {
                requiresConfirmation = true;
                // Store necessary info for confirmation
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  habitIds: [habitIdToDelete], // Store ID for deletion
                  title: botResponse.title, // Store title for prompt
                  confirmationPrompt: `Delete habit "${botResponse.title}" and all its logs? (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt; // Set prompt here
              } else {
                chatMessageToAdd = `Couldn't find habit "${botResponse.title}" to delete. Please check the exact title.`;
              }
              break;

            // --- Case: COMPLETE HABIT FOR DATE ---
            case ACTION_COMPLETE_HABIT_DATE:
              const habitIdToLog = findHabitIdByTitle(botResponse.title);
              const dateToLogStr = botResponse.date || formatDate(new Date()); // Default to today (UTC string)
              const statusToLog = botResponse.status; // Should be true or false
              const parsedDateToLog = parseDate(dateToLogStr); // Parse the date string

              if (habitIdToLog && parsedDateToLog && statusToLog !== null) {
                const habitInfo = habits.find((h) => h.id === habitIdToLog);
                // Pass the parsed Date object to the function
                setHabitCompletionStatus(
                  habitIdToLog,
                  parsedDateToLog,
                  statusToLog
                );

                const statusText = statusToLog
                  ? habitInfo?.type === "bad"
                    ? "avoided"
                    : "done"
                  : habitInfo?.type === "bad"
                  ? "indulged"
                  : "missed";
                chatMessageToAdd = `Okay, marked habit "${botResponse.title}" as ${statusText} for ${dateToLogStr}.`;
              } else {
                let errorReason = [];
                if (!habitIdToLog)
                  errorReason.push(`habit "${botResponse.title}" not found`);
                if (!parsedDateToLog)
                  errorReason.push(
                    `invalid date format "${dateToLogStr}" (use YYYY-MM-DD)`
                  );
                if (statusToLog === null)
                  errorReason.push("missing status (true/false)");
                chatMessageToAdd = `Couldn't log habit. Reason: ${errorReason.join(
                  ", "
                )}.`;
              }
              break;

            // --- Case: SUGGEST HABITS ---
            case ACTION_SUGGEST_HABITS:
              if (
                Array.isArray(botResponse.habits) &&
                botResponse.habits.length > 0
              ) {
                // Validate suggested habits slightly (e.g., check for title)
                const validSuggestions = botResponse.habits.filter(
                  (h) => h && h.title
                );
                if (validSuggestions.length > 0) {
                  requiresConfirmation = true;
                  const habitTitles = validSuggestions
                    .map((h) => `"${h.title}"`)
                    .join(", ");
                  actionDataForConfirmation = {
                    ...actionDataForConfirmation,
                    habits: validSuggestions, // Store only valid ones
                    confirmationPrompt: `AI suggests adding: ${habitTitles}. Add them? (yes/no)`,
                  };
                  confirmationPrompt =
                    actionDataForConfirmation.confirmationPrompt;
                } else {
                  chatMessageToAdd =
                    "AI suggested habits, but they seem invalid.";
                }
              } else {
                chatMessageToAdd =
                  "AI couldn't suggest habits based on the request.";
              }
              break;

            // --- Case: DELETE ALL HABITS ---
            case ACTION_DELETE_ALL_HABITS:
              if (habits.length > 0) {
                requiresConfirmation = true;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt: `Are you sure you want to delete all ${habits.length} habits and their logs? This cannot be undone. (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt;
              } else {
                chatMessageToAdd = "You don't have any habits to delete.";
              }
              break;

            // --- Case: COMPLETE ALL HABITS TODAY ---
            case ACTION_COMPLETE_ALL_HABITS_TODAY:
              const todayForCompleteAll = new Date(); // Local date intent
              const todayStrForCompleteAll = formatDate(todayForCompleteAll); // UTC String
              const activeHabitsTodayForComplete = (
                Array.isArray(habits) ? habits : []
              ).filter((h) => {
                if (!h || !h.startDate) return false;
                try {
                  const s = parseDate(h.startDate);
                  const e = h.endDate ? parseDate(h.endDate) : null;
                  const todayParsed = parseDate(todayStrForCompleteAll);
                  if (!s || !todayParsed) return false;
                  if (h.endDate && !e) return false;
                  return todayParsed >= s && (!e || todayParsed <= e);
                } catch (filterError) {
                  return false;
                }
              });

              if (activeHabitsTodayForComplete.length > 0) {
                requiresConfirmation = true;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt: `Mark all ${activeHabitsTodayForComplete.length} active habits for today as done/avoided? (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt;
              } else {
                chatMessageToAdd =
                  "No habits are active today to mark as complete.";
              }
              break;

            // --- Default Case (Unknown Action) ---
            default:
              chatMessageToAdd =
                "Sorry, I received an unknown habit action request.";
              console.warn(
                "Unknown action received from AI:",
                botResponse.action
              );
          } // End switch
        } catch (actionError) {
          // Catch errors during the processing of a known action
          console.error(
            `Error processing action ${botResponse.action}:`,
            actionError
          );
          chatMessageToAdd = `Sorry, there was an error processing the action: ${botResponse.action}.`;
          requiresConfirmation = false; // Cancel confirmation on error
        }
      } else {
        // --- General Chat or invalid response structure ---
        chatMessageToAdd =
          botResponse.text || "Sorry, I didn't understand that.";
        // console.log("Handling general chat response or fallback."); // Reduce noise

        // --- Simple Name Detection (Example) ---
        const lowerCaseMsg = messageText.toLowerCase();
        const nameKeywords = ["my name is ", "i'm ", "im ", "call me "];
        const keywordFound = nameKeywords.find((kw) =>
          lowerCaseMsg.startsWith(kw)
        );

        if (keywordFound) {
          const potentialName = messageText
            .substring(keywordFound.length)
            .trim();
          // Basic filtering: allow letters, spaces, hyphens; minimum length 2
          const cleanedName = potentialName.replace(/[^a-zA-Z\s-]/g, "").trim();
          if (
            cleanedName &&
            cleanedName.length >= 2 &&
            cleanedName.length <= 30
          ) {
            // Capitalize first letter of each word (simple approach)
            const formattedName = cleanedName
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ");

            setUserName(formattedName);
            console.log(`Potential name detected and set: ${formattedName}`);
            // Override the default AI response with a greeting
            chatMessageToAdd = `Nice to meet you, ${formattedName}! How can I help with your habits today?`;
          }
        }
        // --- End Name Detection ---
      }
      // --- End of Action/Text Handling ---

      // --- Set Confirmation State (if needed) ---
      if (
        requiresConfirmation &&
        actionDataForConfirmation?.confirmationPrompt
      ) {
        setPendingActionData(actionDataForConfirmation);
        setAwaitingConfirmation(true);
        // Use the confirmation prompt as the bot's message
        chatMessageToAdd = confirmationPrompt;
        console.log("Set state for confirmation:", actionDataForConfirmation);
      }

      // --- Add the Final Bot Message to History ---
      if (chatMessageToAdd) {
        // console.log("Adding bot message to chat:", chatMessageToAdd); // Reduce noise
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: chatMessageToAdd },
        ]);
      } else if (!requiresConfirmation) {
        // Only warn if no message AND no confirmation required (should be rare)
        console.warn(
          "No chat message generated and no confirmation needed:",
          botResponse
        );
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, I couldn't generate a response for that.",
          },
        ]);
      }

      // --- FIX: Check for farewell message to close chat ---
      const farewells = ["bye", "goodbye", "exit", "close chat", "close"];
      if (farewells.includes(lowerCaseMessage)) {
        console.log("User said bye, closing chat.");
        // Add a small delay to allow the user to see the bot's final message
        setTimeout(() => {
          toggleChat(); // Call the function to close the chat
        }, 1000); // 1 second delay
      }
      // --- End Farewell Check ---
    } catch (error) {
      // Catch critical errors in the overall chat handling flow
      console.error("Critical Error in handleSendChatMessage:", error);
      try {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "A critical error occurred while processing your request. Please check the console.",
          },
        ]);
      } catch (e) {
        /* ignore potential error during error reporting */
      }
      // Reset confirmation state on critical error
      setPendingActionData(null);
      setAwaitingConfirmation(false);
    } finally {
      // --- Always run after try/catch/finally ---
      setIsChatLoading(false); // Stop loading indicator
      // Refocus input unless waiting for confirmation or chat is closing
      const farewells = ["bye", "goodbye", "exit", "close chat", "close"]; // Check again
      if (!awaitingConfirmation && !farewells.includes(lowerCaseMessage)) {
        try {
          setTimeout(() => chatInputRef.current?.focus(), 0);
        } catch (e) {
          /* ignore focus error */
        }
      }
      // console.log("handleSendChatMessage finished."); // Reduce noise
    }
  }, [
    // --- Dependencies ---
    chatInput, // Needed for farewell check
    chatHistory,
    habits,
    habitLog,
    isChatLoading,
    awaitingConfirmation,
    pendingActionData,
    userName,
    // Callbacks
    upsertHabit,
    findHabitIdByTitle,
    handleDeleteHabitCallback,
    setHabitCompletionStatus,
    setUserName,
    setHabits, // For delete all
    setHabitLog, // For delete all
    toggleChat, // Added toggleChat dependency
  ]);

  const handleChatInputKeyPress = (event) => {
    // Send message on Enter key press (unless Shift+Enter for newline)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline behavior
      handleSendChatMessage();
    }
  };

  // --- Voice Input Logic ---
  const setupSpeechRecognition = useCallback(() => {
    // Check for browser compatibility
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API not supported in this browser.");
      // Optionally disable the mic button if not supported
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Stop listening after first pause
    recognition.interimResults = false; // Only provide final results
    recognition.lang = "en-US"; // Set language

    // Event Handlers
    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice recognition started.");
      setChatInput("Listening..."); // Placeholder in input
    };

    recognition.onresult = (event) => {
      // Get the transcript from the final result
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log("Voice transcript received:", transcript);
      setChatInput(transcript); // Update input field with transcript
      // Optional: Automatically send message after successful recognition?
      // handleSendChatMessage(); // Be cautious with this - might send unintentionally
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      let errorMsg = `Speech error: ${event.error}`;
      // Provide more user-friendly error messages
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        errorMsg =
          "Microphone permission denied. Please allow microphone access in your browser settings and refresh.";
      } else if (event.error === "no-speech") {
        errorMsg = "No speech detected. Please try speaking clearly.";
      } else if (event.error === "audio-capture") {
        errorMsg =
          "Microphone error. Ensure it's connected and working properly.";
      } else if (event.error === "network") {
        errorMsg =
          "Network error during speech recognition. Please check your connection.";
      }
      // Add error message to chat history for visibility
      setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      setIsListening(false);
      // Clear "Listening..." placeholder on error if it's still there
      if (chatInputRef.current?.value === "Listening...") {
        setChatInput("");
      }
    };

    recognition.onend = () => {
      console.log("Voice recognition ended.");
      setIsListening(false);
      // Clear "Listening..." placeholder if no result updated the input
      if (chatInputRef.current?.value === "Listening...") {
        setChatInput("");
      }
      // Refocus the input field after listening stops
      chatInputRef.current?.focus();
    };

    // Store the recognition instance in ref
    recognitionRef.current = recognition;
  }, [setChatHistory, setChatInput]); // Dependencies for callbacks

  // Setup speech recognition on component mount
  useEffect(() => {
    setupSpeechRecognition();
    // Cleanup function to abort recognition if component unmounts while listening
    return () => {
      recognitionRef.current?.abort();
      // console.log("Speech recognition aborted on component unmount."); // Reduce noise
    };
  }, [setupSpeechRecognition]); // Run when setup function changes

  // Handle Mic Button Click
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not initialized or not supported.");
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Speech recognition is not available in this browser.",
        },
      ]);
      return;
    }

    if (isListening) {
      // Stop listening if already active
      recognitionRef.current.stop();
      console.log("Manually stopping voice recognition.");
    } else {
      // Start listening: Request permission first (best practice)
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone permission granted. Starting recognition.");
          setChatInput(""); // Clear input field before listening
          recognitionRef.current.start();
        })
        .catch((err) => {
          // Handle permission denial or other errors
          console.error("Microphone access denied or error:", err);
          let errorText =
            "Could not start voice input. Please ensure microphone access is allowed.";
          if (err.name === "NotAllowedError") {
            errorText =
              "Microphone access denied. Please allow microphone access in browser settings and refresh.";
          } else if (err.name === "NotFoundError") {
            errorText =
              "No microphone found. Please ensure a microphone is connected.";
          }
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: errorText },
          ]);
          setIsListening(false); // Ensure listening state is false if start failed
        });
    }
  };
  // --- End Voice Input Logic ---

  // --- Memoized Values ---
  // Calculate habits active on the currently selected calendar date
  const activeHabitsForSelectedDate = useMemo(() => {
    try {
      // Use the selectedDate state (which is a Date object)
      const selectedDateStr = formatDate(selectedDate); // Convert to UTC string for comparison
      if (!selectedDateStr || !Array.isArray(habits)) return [];

      const selectedD = parseDate(selectedDateStr); // Parse the UTC string back to a comparable Date object
      if (!selectedD) return []; // Invalid selected date string somehow

      return habits.filter((h) => {
        // Ensure habit has necessary properties
        if (!h || !h.startDate) return false;
        const startD = parseDate(h.startDate);
        const endD = h.endDate ? parseDate(h.endDate) : null;

        // Basic validation within the filter
        if (!startD) return false; // Ignore habits with invalid start dates
        if (h.endDate && !endD) return false; // Ignore habits with invalid end dates

        // Check if selected date falls within the habit's active range (inclusive)
        return selectedD >= startD && (!endD || selectedD <= endD);
      });
    } catch (error) {
      console.error(
        "Error calculating active habits for selected date:",
        error
      );
      return []; // Return empty array on error
    }
  }, [habits, selectedDate]); // Dependencies: habits array and selectedDate

  // --- Calendar Tile Styling ---
  // Function to determine CSS class for calendar tiles based on habit log
  const getTileClassName = ({ date, view: calendarView }) => {
    try {
      // Apply styling only to month view days
      if (calendarView !== "month") return null;

      const dateStr = formatDate(date); // Convert tile date to UTC string YYYY-MM-DD
      if (!dateStr) return null; // Invalid date object

      const logForDay = habitLog?.[dateStr]; // Get log entries for this specific day
      const safeHabits = Array.isArray(habits) ? habits : [];

      // Find habits active on this specific tile date
      const tileDate = parseDate(dateStr); // Parse the tile date string
      if (!tileDate) return null; // Should not happen if formatDate worked

      const habitsForDay = safeHabits.filter((h) => {
        if (!h || !h.startDate) return false;
        const s = parseDate(h.startDate);
        const e = h.endDate ? parseDate(h.endDate) : null;
        if (!s) return false;
        if (h.endDate && !e) return false;
        return tileDate >= s && (!e || tileDate <= e);
      });

      // If no habits are active on this day, no special styling needed
      if (habitsForDay.length === 0) return null;

      // If there are active habits, check their log status
      if (!logForDay) {
        // Habits active, but nothing logged yet for this day
        return "habit-day-pending"; // Style for days with pending habits
      }

      // Calculate completed and missed counts for active habits on this day
      const completedCount = habitsForDay.filter(
        (h) => logForDay[h.id] === true
      ).length;
      const missedCount = habitsForDay.filter(
        (h) => logForDay[h.id] === false
      ).length;
      const loggedCount = completedCount + missedCount;

      // Determine class based on completion status
      if (loggedCount === 0 && habitsForDay.length > 0) {
        // Active habits exist, but none are logged (same as !logForDay case)
        return "habit-day-pending";
      }
      if (completedCount === habitsForDay.length) {
        return "habit-day-all-complete"; // All active habits completed/avoided
      }
      if (
        missedCount > 0 &&
        completedCount === 0 &&
        loggedCount === habitsForDay.length
      ) {
        // All active habits were logged, and at least one (or all) was missed/indulged, none completed
        return "habit-day-all-missed";
      }
      // If partially logged (some done, some missed, or some still pending but at least one logged)
      if (loggedCount > 0) {
        return "habit-day-partial-log"; // Mix of statuses or partially logged
      }

      // Fallback if logic somehow misses a case (shouldn't happen)
      return null;
    } catch (error) {
      console.error("Error in getTileClassName:", error);
      return null; // Return null on error to avoid breaking calendar render
    }
  };

  // --- Render JSX ---
  return (
    // Main container: Full height, flex column, gradient background
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Header: Sticky, blurred background, contains title and controls */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* App Title */}
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Habit Tracker AI
          </h1>
          {/* Right side controls: Greeting, Date, Dark Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getGreeting()}, {userName}!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentDate.toLocaleDateString(undefined, {
                  // Display local date
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
      {/* Main Content Area: Flexible grid layout, handles scrolling */}
      {/* FIX: Reduced top padding (py-2), kept bottom padding (pb-24) */}
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-2 md:py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-24">
        {/* --- Left Column (lg screens) / Top Section (mobile) --- */}
        {/* Removed overflow-y-auto, just a layout container now */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col">
          {/* Calendar Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
                Habit Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {/* Wrapper to control calendar size if needed */}
              <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
                <Calendar
                  onChange={setSelectedDate} // Update selectedDate state
                  value={selectedDate} // Control calendar value
                  tileClassName={getTileClassName} // Apply custom styles to tiles
                  maxDate={new Date()} // Prevent selecting future dates
                  minDate={new Date(new Date().getFullYear() - 5, 0, 1)} // Limit past view (e.g., 5 years)
                  className="text-sm" // Base styles handled by CSS below
                  // locale="en-US" // Optional: Explicitly set locale
                />
              </div>
            </CardContent>
          </Card>

          {/* Daily Habit Log Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90">
            <CardHeader>
              <CardTitle className="text-lg">
                Log for {formatDate(selectedDate) || "Selected Date"}{" "}
                {/* Display formatted UTC date */}
              </CardTitle>
            </CardHeader>
            {/* Keep internal scroll for long lists */}
            <CardContent className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {activeHabitsForSelectedDate.length > 0 ? (
                <ul className="space-y-3">
                  {activeHabitsForSelectedDate.map((habit) => {
                    // Determine log status for this habit on the selected date
                    const logStatus =
                      habitLog[formatDate(selectedDate)]?.[habit.id];
                    const isGoodHabit = habit.type !== "bad";
                    // Define text and icons based on habit type and status
                    const doneText = isGoodHabit ? "Done" : "Avoided";
                    const missedText = isGoodHabit ? "Missed" : "Indulged";
                    const doneIcon = <CheckCircle size={16} className="mr-1" />; // Consistent check icon
                    const missedIcon = isGoodHabit ? (
                      <XCircle size={16} className="mr-1" />
                    ) : (
                      <AlertTriangle
                        size={16}
                        className="mr-1 text-orange-500"
                      />
                    ); // Alert for indulgence

                    return (
                      <li
                        key={habit.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 gap-2"
                      >
                        {/* Habit Title and Type Indicator */}
                        <span className="font-medium text-sm md:text-base flex items-center gap-2 flex-grow min-w-0 mr-2">
                          {habit.type === "bad" ? (
                            <ThumbsDown
                              size={14}
                              className="text-red-500 flex-shrink-0"
                            />
                          ) : (
                            <ThumbsUp
                              size={14}
                              className="text-green-500 flex-shrink-0"
                            />
                          )}
                          <span className="truncate">{habit.title}</span>{" "}
                          {/* Add truncate */}
                        </span>
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
                          {/* Done/Avoided Button */}
                          <Button
                            variant={
                              logStatus === true
                                ? isGoodHabit
                                  ? "default"
                                  : "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setHabitCompletionStatus(
                                habit.id,
                                selectedDate,
                                true
                              )
                            }
                            className={`w-24 justify-center ${
                              logStatus === true
                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                                : "dark:text-gray-200 dark:border-gray-600"
                            }`}
                            aria-label={`Mark ${habit.title} as ${doneText}`}
                          >
                            {doneIcon} {doneText}
                          </Button>
                          {/* Missed/Indulged Button */}
                          <Button
                            variant={
                              logStatus === false ? "destructive" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setHabitCompletionStatus(
                                habit.id,
                                selectedDate,
                                false
                              )
                            }
                            className={`w-24 justify-center ${
                              logStatus === false
                                ? "bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                                : "dark:text-gray-200 dark:border-gray-600"
                            }`}
                            aria-label={`Mark ${habit.title} as ${missedText}`}
                          >
                            {missedIcon} {missedText}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                // Message when no habits are scheduled for the selected date
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                  No habits scheduled for this date.
                </p>
              )}
            </CardContent>
          </Card>
        </div>{" "}
        {/* End Left Column / Top Section */}
        {/* --- Right Column (lg screens) / Bottom Section (mobile) --- */}
        {/* Removed overflow-hidden, just a layout container now */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
          {/* Habit AI Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain size={20} className="text-blue-500" />
                Habit Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-start gap-2 shadow-sm border border-blue-200 dark:border-blue-800 min-h-[4rem]">
              {" "}
              {/* Added min-height */}
              <Brain
                size={20}
                className={`flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 ${
                  isLoadingSuggestion ? "animate-pulse" : ""
                }`}
              />
              <div className="italic whitespace-pre-line text-xs sm:text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                <ReactMarkdown>
                  {isLoadingSuggestion ? "Getting suggestion..." : aiSuggestion}
                </ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter>
              {/* Add New Habit Button */}
              <Button
                onClick={openModalForNewHabit}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
              >
                <Plus size={18} className="mr-2" /> Add New Habit
              </Button>
            </CardFooter>
          </Card>

          {/* Habit List Management Card */}
          {/* Removed flex-grow and overflow-hidden */}
          <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
                Manage Habits
              </CardTitle>
            </CardHeader>
            {/* Keep internal scroll for long lists, removed flex-grow, keep pb-20 */}
            <CardContent className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-[calc(100vh-35rem)] pb-20">
              {" "}
              {/* Adjusted max-h slightly, keep pb-20 */}
              {habits.length > 0 ? (
                <ul className="space-y-2">
                  {habits.map((habit) => (
                    <li
                      key={habit.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 group bg-white dark:bg-gray-900"
                    >
                      {/* Habit Info */}
                      <div className="flex items-center space-x-2 text-sm flex-grow min-w-0 mr-1">
                        {habit.type === "bad" ? (
                          <ThumbsDown
                            size={16}
                            className="text-red-500 flex-shrink-0"
                          />
                        ) : (
                          <ThumbsUp
                            size={16}
                            className="text-green-500 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          {" "}
                          {/* Wrapper for truncate */}
                          <span className="font-medium block truncate">
                            {" "}
                            {/* Added truncate */}
                            {habit.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">
                            {habit.startDate} to {habit.endDate || "Ongoing"}
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons (Edit/Delete) - Appear on hover/focus */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 h-7 w-7"
                          onClick={() => openModalForEditHabit(habit)}
                          aria-label={`Edit habit ${habit.title}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 h-7 w-7"
                          onClick={() => {
                            // Optional: Add a simple confirmation here if not using AI confirmation
                            // if (window.confirm(`Delete habit "${habit.title}"?`)) {
                            handleDeleteHabitCallback(habit.id);
                            // }
                          }}
                          aria-label={`Delete habit ${habit.title}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                // Message when no habits are defined
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 flex flex-col items-center gap-2">
                  <Info size={24} />
                  <span>No habits defined yet.</span>
                  <span>Click "Add New Habit" or ask the AI!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>{" "}
        {/* End Right Column / Bottom Section */}
        {/* Floating Action Button for Chat */}
        {/* Show only if chat window is closed */}
        {!isChatOpen && (
          <Button
            onClick={toggleChat}
            variant="default" // Use default blue style
            size="icon"
            className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition-transform hover:scale-110 flex items-center justify-center" // Ensure icon is centered
            aria-label="Open Chat Assistant"
          >
            <MessageSquare size={24} />
          </Button>
        )}
      </main>{" "}
      {/* End Main Content Area */}
      {/* Chat Window (Drawer) */}
      {/* Conditionally rendered based on isChatOpen state */}
      {isChatOpen && (
        <>
          {/* Overlay for closing chat on mobile */}
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden" // Only show overlay on smaller screens
            onClick={toggleChat}
            aria-hidden="true"
          ></div>
          {/* Chat Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white dark:bg-gray-900 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
              isChatOpen ? "translate-x-0" : "translate-x-full" // Slide in/out animation
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            {/* Use Card component for consistent styling */}
            <Card className="h-full flex flex-col border-0 shadow-none rounded-none bg-transparent">
              {" "}
              {/* Remove card background/border */}
              {/* Chat Header */}
              {/* FIX: Added relative positioning, adjusted padding, removed dark mode toggle */}
              <CardHeader className="relative flex-shrink-0 border-b border-gray-200 flex items-center p-4 bg-white dark:bg-gray-900">
                {" "}
                {/* Make relative */}
                {/* Add padding-right to title to avoid overlap with close button */}
                <CardTitle
                  id="chat-title"
                  className="flex items-center gap-2 text-lg pr-10"
                >
                  {" "}
                  {/* Reduced padding slightly */}
                  <MessageSquare
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Habit Assistant
                </CardTitle>
                {/* Close Button absolutely positioned */}
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="icon"
                  aria-label="Close Chat"
                  // FIX: Adjusted position, size, and added z-index
                  className="absolute top-2 right-2 z-10 h-9 w-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={22} /> {/* Slightly larger icon */}
                </Button>
              </CardHeader>
              {/* Chat Message Area */}
              <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-white dark:bg-gray-900">
                {" "}
                {/* Add background back */}
                {/* Map through chat history */}
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : "" // Align user messages right
                    }`}
                  >
                    {/* Bot Icon */}
                    {msg.sender === "bot" && (
                      <Bot
                        size={24}
                        className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900"
                      />
                    )}
                    {/* Message Bubble */}
                    <div
                      className={`p-2.5 rounded-lg max-w-[85%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100" // User message style
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" // Bot message style
                      }`}
                    >
                      {/* Apply prose styling to this wrapper div */}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown
                          components={{
                            // Customize link rendering
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              />
                            ),
                          }}
                        >
                          {msg.text || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {/* User Icon */}
                    {msg.sender === "user" && (
                      <User
                        size={24}
                        className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-blue-100 dark:bg-blue-900"
                      />
                    )}
                  </div>
                ))}
                {/* Loading Indicator */}
                {isChatLoading && (
                  <div className="flex items-start gap-2.5">
                    <Bot
                      size={24}
                      className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse"
                    />
                    <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic text-sm">
                      Assistant is thinking...
                    </div>
                  </div>
                )}
                {/* Scroll Anchor */}
                <div ref={chatMessagesEndRef} />
              </CardContent>
              {/* Chat Input Footer */}
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4 bg-white dark:bg-gray-900 flex-shrink-0">
                {" "}
                {/* Add background back */}
                <div className="flex w-full items-center space-x-2">
                  {/* Text Input */}
                  <Input
                    ref={chatInputRef}
                    type="text"
                    placeholder={
                      isListening
                        ? "Listening..."
                        : awaitingConfirmation
                        ? "Confirm (yes/no)..."
                        : `Ask about habits...`
                    }
                    className="flex-1"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatInputKeyPress} // Handle Enter key press
                    disabled={isChatLoading && !awaitingConfirmation} // Disable input while loading, unless confirming
                    aria-label="Chat input"
                  />
                  {/* Microphone Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMicClick}
                    disabled={isChatLoading} // Disable while bot is thinking
                    className={`text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${
                      isListening ? "text-red-500 animate-pulse" : "" // Style when listening
                    }`}
                    title={isListening ? "Stop Listening" : "Start Listening"}
                    aria-label={
                      isListening ? "Stop listening" : "Start voice input"
                    }
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </Button>
                  {/* Send Button */}
                  <Button
                    size="icon"
                    onClick={handleSendChatMessage}
                    disabled={
                      // Disable unless there's input or awaiting confirmation
                      (!chatInput.trim() && !awaitingConfirmation) ||
                      (isChatLoading && !awaitingConfirmation)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    aria-label="Send chat message"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>{" "}
          {/* End Chat Panel */}
        </>
      )}
      {/* Add/Edit Habit Modal */}
      <Dialog open={isHabitModalOpen} onClose={closeHabitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHabit ? "Edit Habit" : "Add New Habit"}
            </DialogTitle>
          </DialogHeader>
          {/* Form for adding/editing habits */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent default form submission
              handleHabitModalSave();
            }}
          >
            <div className="space-y-4">
              {/* Habit Title Input */}
              <div>
                <label
                  htmlFor="habit-title-modal"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="habit-title-modal"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="E.g., Exercise daily, Avoid snacks"
                  className="w-full"
                  autoFocus // Focus this field when modal opens
                  required
                  maxLength={100} // Add max length
                />
              </div>
              {/* Habit Type Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Type
                </label>
                {/* Pass value and onValueChange to RadioGroup */}
                <RadioGroup
                  value={newHabitType}
                  onValueChange={setNewHabitType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    {/* RadioGroupItem no longer needs checked/onChange */}
                    <RadioGroupItem value="good" id="type-good" />
                    <label
                      htmlFor="type-good"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Build Good Habit
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bad" id="type-bad" />
                    <label
                      htmlFor="type-bad"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Break Bad Habit
                    </label>
                  </div>
                </RadioGroup>
              </div>
              {/* Start and End Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="habit-start-modal"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="habit-start-modal"
                    type="date"
                    value={newHabitStartDate}
                    onChange={(e) => setNewHabitStartDate(e.target.value)}
                    className="w-full"
                    required
                    max={formatDate(
                      new Date(new Date().getFullYear() + 10, 11, 31)
                    )} // Optional: Limit future start date
                  />
                </div>
                <div>
                  <label
                    htmlFor="habit-end-modal"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    End Date <span className="text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="habit-end-modal"
                    type="date"
                    value={newHabitEndDate}
                    onChange={(e) => setNewHabitEndDate(e.target.value)}
                    className="w-full"
                    min={newHabitStartDate || undefined} // End date cannot be before start date
                    max={formatDate(
                      new Date(new Date().getFullYear() + 20, 11, 31)
                    )} // Optional: Limit future end date
                  />
                </div>
              </div>
            </div>
            {/* Modal Footer with Buttons */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeHabitModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
              >
                {editingHabit ? "Save Changes" : "Add Habit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Custom CSS for Calendar and Scrollbars */}
      <style>{`
        /* --- React Calendar Customization --- */

        /* Basic Calendar Container */
        .react-calendar-wrapper { max-width: 100%; padding: 0; }
        .react-calendar {
          width: 100% !important; /* Ensure it takes full width of wrapper */
          border: 1px solid #e5e7eb; /* light: gray-200 */
          border-radius: 0.5rem; /* rounded-lg */
          background: transparent; /* Use card background */
          font-family: inherit; /* Use app font */
          line-height: 1.5;
        }
        .dark .react-calendar { border-color: #374151; /* dark: gray-700 */ }

        /* Navigation Bar (Prev/Next Month, Label) */
        .react-calendar__navigation { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em; padding: 0.25em 0.5em; }
        .react-calendar__navigation button {
          min-width: 40px;
          background: none;
          border: none;
          padding: 0.5em;
          border-radius: 0.375rem; /* rounded-md */
          font-weight: 600;
          color: #374151; /* light: gray-700 */
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .dark .react-calendar__navigation button { color: #d1d5db; /* dark: gray-300 */ }
        .react-calendar__navigation button:disabled { opacity: 0.5; cursor: not-allowed; }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; /* light: gray-100 */ }
        .dark .react-calendar__navigation button:enabled:hover,
        .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; /* dark: gray-700 */ }
        .react-calendar__navigation__label { font-weight: bold; font-size: 0.9em; flex-grow: 0 !important; } /* Prevent label stretching */
        .dark .react-calendar__navigation__label { color: #e5e7eb; /* dark: gray-200 */ }

        /* Weekday Headers */
        .react-calendar__month-view__weekdays { text-align: center; font-weight: bold; color: #6b7280; /* light: gray-500 */ }
        .dark .react-calendar__month-view__weekdays abbr { color: #9ca3af; /* dark: gray-400 */ text-decoration: none !important; }
        .react-calendar__month-view__weekdays__weekday { padding: 0.5em; }
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; cursor: default; }

        /* Day Tiles */
        .react-calendar__tile {
          border-radius: 0.375rem; /* rounded-md */
          transition: background-color 0.2s, border-color 0.2s, color 0.2s;
          padding: 0.5em 0.5em; /* Adjust padding as needed */
          line-height: 1.2;
          border: 1px solid transparent;
          text-align: center;
          cursor: pointer;
          font-size: 0.85em; /* Slightly smaller day numbers */
          aspect-ratio: 1 / 1; /* Make tiles square */
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .react-calendar__month-view__days__day { color: #1f2937; /* light: gray-800 */ }
        .dark .react-calendar__month-view__days__day { color: #e5e7eb; /* dark: gray-200 */ }

        /* Neighboring Month Days */
        .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; /* light: gray-400 */ opacity: 0.7; }
        .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; /* dark: gray-500 */ opacity: 0.7; }

        /* Disabled Day Tiles */
        .react-calendar__tile:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: 0.5; }
        .dark .react-calendar__tile:disabled { background-color: #1f2937; color: #6b7280; opacity: 0.5; }

        /* Hover/Focus on Enabled Day Tiles */
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus { background-color: #e5e7eb; /* light: gray-200 */ }
        .dark .react-calendar__tile:enabled:hover,
        .dark .react-calendar__tile:enabled:focus { background-color: #374151; /* dark: gray-700 */ }

        /* Today's Date Tile */
        .react-calendar__tile--now { background: #dbeafe !important; /* light: blue-100 */ font-weight: bold; border: 1px solid #bfdbfe !important; /* light: blue-200 */ }
        .dark .react-calendar__tile--now { background: #1e3a8a !important; /* dark: blue-800 */ border-color: #3b82f6 !important; /* dark: blue-500 */ color: white !important; }

        /* Selected Date Tile */
        .react-calendar__tile--active { background: #60a5fa !important; /* light: blue-400 */ color: white !important; }
        .dark .react-calendar__tile--active { background: #3b82f6 !important; /* dark: blue-500 */ color: white !important; }
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; /* light: blue-500 */ }
        .dark .react-calendar__tile--active:enabled:hover,
        .dark .react-calendar__tile--active:enabled:focus { background: #2563eb !important; /* dark: blue-600 */ }

        /* --- Custom Habit Day Styles --- */
        /* All habits completed/avoided */
        .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; }
        .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }

        /* At least one habit missed/indulged, none completed */
        .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
        .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }

        /* Some logged, some pending OR mix of completed/missed */
        .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; }
        .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }

        /* Active habits, but none logged yet */
        .habit-day-pending { border-color: #d1d5db !important; /* light: gray-300 */ } /* Subtle border */
        .dark .habit-day-pending { border-color: #4b5563 !important; /* dark: gray-600 */ }

        /* Ensure selected day text remains white on custom backgrounds */
        .react-calendar__tile--active.habit-day-all-complete,
        .react-calendar__tile--active.habit-day-all-missed,
        .react-calendar__tile--active.habit-day-partial-log,
        .react-calendar__tile--active.habit-day-pending {
          color: white !important;
        }
        .dark .react-calendar__tile--active.habit-day-all-complete,
        .dark .react-calendar__tile--active.habit-day-all-missed,
        .dark .react-calendar__tile--active.habit-day-partial-log,
        .dark .react-calendar__tile--active.habit-day-pending {
          color: white !important;
        }


        /* --- Scrollbar Styling --- */
        /* Firefox */
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; /* light: thumb track */ }
        .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; /* dark: thumb track */ }

        /* Webkit (Chrome, Safari, Edge) */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #d1d5db; /* light: gray-300 */ border-radius: 3px; border: 1px solid transparent; /* Optional: adds padding */ }
        .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; /* dark: gray-600 */ }
        ::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; /* light: gray-400 */ }
        .dark ::-webkit-scrollbar-thumb:hover { background-color: #6b7280; /* dark: gray-500 */ }

        /* --- Tailwind Prose Customization for Chat --- */
        .prose p:first-child, .prose p:last-child { margin-top: 0; margin-bottom: 0; } /* Reduce margins for chat bubbles */
        .dark .prose-invert { --tw-prose-body: #d1d5db; --tw-prose-headings: #fff; /* Adjust other colors as needed */ }

      `}</style>
    </div> // End Main Container
  );
}

export default App;
