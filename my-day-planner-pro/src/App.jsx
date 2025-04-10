import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Check,
  Clock,
  Zap,
  Coffee,
  Brain,
  Moon,
  Sun,
  Award,
  TrendingUp,
  Wind,
  MessageSquare,
  Send,
  User,
  Bot,
  X,
  Menu,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Mic,
  MicOff,
} from "lucide-react";

// --- IMPORTANT SECURITY WARNING ---

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// --- Action Constants ---

const ACTION_ADD_TASK = "add_task";

const ACTION_ADD_RECURRING_TASK = "add_recurring_task";

const ACTION_COMPLETE_TASK = "complete_task";

const ACTION_DELETE_TASK = "delete_task";

const ACTION_COMPLETE_AND_DELETE_TASK = "complete_and_delete_task";

const ACTION_COMPLETE_ALL_TASKS = "complete_all_tasks";

const ACTION_COMPLETE_TASKS_UNTIL = "complete_tasks_until";

const ACTION_SUGGEST_TASKS = "suggest_tasks";

const ACTION_COMPLETE_TASKS_MATCHING = "complete_tasks_matching";

const ACTION_DELETE_ALL_TASKS = "delete_all_tasks";

// --- Helper: Time Conversion ---

const timeToMinutes = (timeStr) => {
  /* ... */ if (!timeStr || !timeStr.includes(":")) return null;

  const [hours, minutes] = timeStr.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return null;

  return hours * 60 + minutes;
};

// Mock shadcn/ui components

const Button = ({
  children,

  variant = "default",

  size = "default",

  className = "",

  ...props
}) => {
  /* ... */ const baseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-600/90",

    destructive: "bg-red-600 text-white hover:bg-red-600/90",

    outline:
      "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900",

    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80",

    ghost: "hover:bg-gray-100 hover:text-gray-900",

    link: "text-blue-600 underline-offset-4 hover:underline",
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

const Input = ({ className = "", type = "text", ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Checkbox = ({ className = "", ...props }) => (
  <input
    type="checkbox"
    className={`h-4 w-4 shrink-0 rounded-sm border border-gray-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:text-white ${className}`}
    {...props}
  />
);

const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow ${className}`}
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
  <p className={`text-sm text-gray-500 ${className}`} {...props}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {" "}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto">
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
};

const DialogContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const DialogHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const DialogTitle = ({ children, className = "", as = "h2", ...props }) => {
  const Tag = as;

  return (
    <Tag className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </Tag>
  );
};

const DialogFooter = ({ children, className = "", ...props }) => (
  <div
    className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Helper function to get greeting based on time

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";

  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
};

// --- Function to call Gemini API for MOTIVATION ---

async function fetchMotivationSuggestion(taskList) {
  /* ... (remains same) ... */

  if (!GEMINI_API_KEY) return "API Key missing.";

  if (
    !GEMINI_API_ENDPOINT.includes("key=" + GEMINI_API_KEY) ||
    !GEMINI_API_ENDPOINT.startsWith("https://")
  )
    return "API Endpoint config error.";

  const pendingTasks = taskList.filter((t) => !t.completed);

  const completedTasks = taskList.filter((t) => t.completed);

  let prompt = `You are a motivational assistant for a day planner app. The user has ${
    pendingTasks.length
  } pending tasks and ${
    completedTasks.length
  } completed tasks. Current time is ${new Date().toLocaleTimeString()}. `;

  if (pendingTasks.length > 0) {
    prompt += `Pending tasks are: ${pendingTasks

      .map((t) => t.title)

      .join(", ")}. `;
  } else {
    prompt += "All tasks are completed or there are no tasks. ";
  }

  prompt +=
    "First, provide a short (1-2 sentences), encouraging, and context-aware motivational message. Then, on a new line, provide a short, relevant motivational quote prefixed with 'Quote:'.";

  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  console.log("Sending motivation prompt:", prompt);

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

        errorBody = JSON.stringify(errorJson);
      } catch (e) {}

      console.error("Gemini API Error:", errorBody);

      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!suggestionText) {
      console.error("Could not parse suggestion text:", data);

      return "Could not parse suggestion.";
    }

    console.log("Received motivation response:", suggestionText);

    return suggestionText.trim();
  } catch (error) {
    console.error("Error fetching motivation:", error);

    if (error.message.includes("Failed to fetch")) return "Network/CORS error.";

    return `Error: ${error.message}`;
  }
}

// --- Function to call Gemini API for CHAT (Further Improved Instructions) ---

async function fetchChatResponse(taskList, chatHistory, userMessage, userName) {
  if (!GEMINI_API_KEY) return { text: "API Key missing." };

  if (
    !GEMINI_API_ENDPOINT.includes("key=" + GEMINI_API_KEY) ||
    !GEMINI_API_ENDPOINT.startsWith("https://")
  )
    return { text: "API Endpoint config error." };

  // --- Updated Prompt Instructions ---

  // *** UPDATED Persona and Scope ***

  let prompt = `You are ${userName}'s friendly, encouraging, and helpful AI assistant integrated into their day planner app. Be concise and helpful. Format your response using simple Markdown. \n`;

  prompt += `Your primary goal is to help manage tasks (add, complete, delete, suggest). You can also provide brief motivational quotes or answer simple general knowledge questions if asked directly, but always gently steer back to planner tasks.\n`;

  prompt += `IMPORTANT ACTION INSTRUCTIONS:\n`;

  // *** UPDATED: Emphasize core title extraction ***

  prompt += `- ADD SINGLE task: If user asks to add ONE task (e.g., "add task to buy milk at 3pm", "add drink water"), extract the **CORE task title** (e.g., "Buy Milk", "Drink Water"), start time (HH:MM), and end time (HH:MM). Respond ONLY with JSON: {"action": "${ACTION_ADD_TASK}", "title": "Core Task Title", "time": "HH:MM" or null, "endTime": "HH:MM" or null}\n`;

  prompt += `- ADD MULTIPLE DISTINCT tasks: If user lists multiple different tasks at once, **ask them to add each task individually for now.**\n`;

  prompt += `- ADD RECURRING task: Extract core title, interval ("hourly", "daily"), start/end times (HH:MM). If start is "now", use null startTime. Default 8am-8pm hourly. Respond ONLY with JSON: {"action": "${ACTION_ADD_RECURRING_TASK}", "title": "Core Title", "interval": "hourly" or "daily", "startTime": "HH:MM" or null, "endTime": "HH:MM" or null}\n`;

  prompt += `- SUGGEST TASKS: If user asks for tasks on a topic, suggest 2-3 relevant tasks. Respond ONLY with JSON: {"action": "${ACTION_SUGGEST_TASKS}", "tasks": [{"title": "...", "time": "HH:MM" or null, "endTime": "HH:MM" or null}, ...]}\n`;

  // *** UPDATED: Emphasize exact title & overlap check ***

  prompt += `- COMPLETE/DELETE/COMPLETE&DELETE task: Identify the **exact task title** from the user message or task list. If ambiguous, ask for clarification. If adding/modifying results in a time overlap, point it out and ask how to proceed (e.g., "Adding Task X overlaps Task Y. Add anyway?"). Respond ONLY with JSON containing action ("${ACTION_COMPLETE_TASK}", "${ACTION_DELETE_TASK}", "${ACTION_COMPLETE_AND_DELETE_TASK}") and "title".\n`;

  prompt += `- COMPLETE ALL tasks: ONLY if user says "complete ALL tasks" without specifying a name. Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_ALL_TASKS}"}\n`;

  prompt += `- COMPLETE MULTIPLE tasks by name: If user asks to complete multiple tasks matching a name, identify the core title pattern. Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_TASKS_MATCHING}", "title_pattern": "Core Title Pattern"}\n`;

  prompt += `- COMPLETE UNTIL time: Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_TASKS_UNTIL}", "time": "HH:MM"}\n`;

  prompt += `- DELETE ALL tasks: ONLY if user says "delete ALL tasks". Respond ONLY with JSON: {"action": "${ACTION_DELETE_ALL_TASKS}"}\n`;

  // *** NEW: Update Task Limitation ***

  prompt += `- UPDATE TASK: You cannot update existing tasks yet. Inform the user politely if they ask to update a task.\n`;

  prompt += `- Respond ONLY with the JSON structure when performing an action. No extra text.\n`;

  prompt += `- For all other conversation, respond normally and be friendly.\n`;

  prompt += `\nCurrent tasks: \n`;

  if (taskList.length > 0) {
    taskList.forEach((task) => {
      prompt += `- ${task.title} (${
        task.completed ? "Completed" : "Pending"
      }) ${task.time ? " at " + task.time : ""}${
        task.endTime ? " until " + task.endTime : ""
      }\n`;
    });
  } else {
    prompt += `- No tasks today.\n`;
  }

  prompt += `\nConversation History:\n`;

  const recentHistory = chatHistory.slice(-6);

  recentHistory.forEach((msg) => {
    prompt += `${msg.sender === "user" ? userName : "Assistant"}: ${
      msg.text
    }\n`;
  }); // Use userName in history

  prompt += `${userName}: ${userMessage}\nAssistant:`;

  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  console.log("Sending chat prompt:", prompt);

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

        errorBody = JSON.stringify(errorJson);
      } catch (e) {
        /* ignore */
      }

      console.error("Gemini API Error:", errorBody);

      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!chatResponseText) {
      console.error("Could not parse chat response:", data);

      return { text: "Could not parse response." };
    }

    console.log("Received chat response:", chatResponseText);

    // --- Parsing Logic ---

    let actionData = null;

    const possibleActions = [
      ACTION_ADD_TASK,

      ACTION_ADD_RECURRING_TASK,

      ACTION_COMPLETE_TASK,

      ACTION_DELETE_TASK,

      ACTION_COMPLETE_AND_DELETE_TASK,

      ACTION_COMPLETE_ALL_TASKS,

      ACTION_COMPLETE_TASKS_UNTIL,

      ACTION_SUGGEST_TASKS,

      ACTION_COMPLETE_TASKS_MATCHING,

      ACTION_DELETE_ALL_TASKS,
    ];

    const singleTaskActions = [
      ACTION_ADD_TASK,

      ACTION_COMPLETE_TASK,

      ACTION_DELETE_TASK,

      ACTION_COMPLETE_AND_DELETE_TASK,
    ];

    const bulkTimeActions = [ACTION_COMPLETE_TASKS_UNTIL];

    const bulkMatchingActions = [ACTION_COMPLETE_TASKS_MATCHING];

    const noParamActions = [ACTION_COMPLETE_ALL_TASKS, ACTION_DELETE_ALL_TASKS];

    try {
      const potentialJson = JSON.parse(chatResponseText);

      if (
        potentialJson.action &&
        possibleActions.includes(potentialJson.action)
      ) {
        if (
          singleTaskActions.includes(potentialJson.action) &&
          potentialJson.title
        )
          actionData = potentialJson;
        else if (
          potentialJson.action === ACTION_ADD_RECURRING_TASK &&
          potentialJson.title &&
          potentialJson.interval
        )
          actionData = potentialJson;
        else if (
          bulkTimeActions.includes(potentialJson.action) &&
          potentialJson.time
        )
          actionData = potentialJson;
        else if (
          potentialJson.action === ACTION_SUGGEST_TASKS &&
          Array.isArray(potentialJson.tasks)
        )
          actionData = potentialJson;
        else if (
          bulkMatchingActions.includes(potentialJson.action) &&
          potentialJson.title_pattern
        )
          actionData = potentialJson;
        else if (noParamActions.includes(potentialJson.action))
          actionData = potentialJson;
      }
    } catch (e) {
      const jsonRegex = /\{[\s\S]*?\"action\"\s*:\s*\"([_a-zA-Z]+)\"[\s\S]*?\}/;

      const match = chatResponseText.match(jsonRegex);

      if (match && match[0]) {
        try {
          const extractedJson = JSON.parse(match[0]);

          if (
            extractedJson.action &&
            possibleActions.includes(extractedJson.action)
          ) {
            if (
              singleTaskActions.includes(extractedJson.action) &&
              extractedJson.title
            )
              actionData = extractedJson;
            else if (
              extractedJson.action === ACTION_ADD_RECURRING_TASK &&
              extractedJson.title &&
              extractedJson.interval
            )
              actionData = extractedJson;
            else if (
              bulkTimeActions.includes(extractedJson.action) &&
              extractedJson.time
            )
              actionData = extractedJson;
            else if (
              extractedJson.action === ACTION_SUGGEST_TASKS &&
              Array.isArray(extractedJson.tasks)
            )
              actionData = extractedJson;
            else if (
              bulkMatchingActions.includes(extractedJson.action) &&
              extractedJson.title_pattern
            )
              actionData = extractedJson;
            else if (noParamActions.includes(extractedJson.action))
              actionData = extractedJson;

            if (actionData)
              console.log("Extracted action JSON via regex:", actionData);
          }
        } catch (parseError) {
          console.warn(
            "Found potential JSON action, failed parse:",

            parseError
          );
        }
      }
    }

    if (actionData) {
      actionData.title = actionData.title || null;

      actionData.time = actionData.time || null;

      actionData.endTime = actionData.endTime || null;

      actionData.startTime = actionData.startTime || null;

      actionData.interval = actionData.interval || null;

      actionData.tasks = actionData.tasks || null;

      actionData.title_pattern = actionData.title_pattern || null;

      return actionData;
    } else {
      return { text: chatResponseText.trim() };
    }
  } catch (error) {
    console.error("Error fetching chat response:", error);

    if (error.message.includes("Failed to fetch"))
      return { text: "Network/CORS error." };

    return { text: `Error: ${error.message}` };
  }
}

// Main App Component

function App() {
  // --- State Definitions ---

  const [tasks, setTasks] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [newTaskTime, setNewTaskTime] = useState("");

  const [newTaskEndTime, setNewTaskEndTime] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);

  const [currentDate] = useState(new Date());

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(
    timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`)
  );

  const [activeTaskIds, setActiveTaskIds] = useState([]);

  const [aiSuggestion, setAiSuggestion] = useState("Loading suggestion...");

  const [aiIcon, setAiIcon] = useState(Brain);

  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

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

  useEffect(() => {
    /* Load tasks & name */ try {
      const storedTasks = localStorage.getItem("dayPlannerTasks");

      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);

        setTasks(
          parsedTasks.map((task) => ({
            ...task,

            completed: task.completed || false,
          }))
        );
      } else {
        setTasks([]);
      }

      const storedName = localStorage.getItem("dayPlannerUserName");

      if (storedName) {
        setUserName(storedName);

        console.log("Loaded name:", storedName);
      }
    } catch (error) {
      console.error("Failed load tasks/name:", error);

      localStorage.removeItem("dayPlannerTasks");

      localStorage.removeItem("dayPlannerUserName");

      setTasks([]);
    }
  }, []);

  useEffect(() => {
    /* Save tasks */ if (
      tasks.length > 0 ||
      localStorage.getItem("dayPlannerTasks") !== null
    ) {
      try {
        localStorage.setItem("dayPlannerTasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed save tasks:", error);
      }
    }
  }, [tasks]);

  useEffect(() => {
    /* Save Name */ if (userName !== "User") {
      try {
        localStorage.setItem("dayPlannerUserName", userName);

        console.log("Saved name:", userName);
      } catch (error) {
        console.error("Failed save name:", error);
      }
    }
  }, [userName]);

  useEffect(() => {
    /* Fetch Suggestion */ if (GEMINI_API_KEY) {
      setIsLoadingSuggestion(true);

      setAiIcon(() => Brain);

      const timer = setTimeout(() => {
        fetchMotivationSuggestion(tasks)
          .then((suggestion) => {
            setAiSuggestion(suggestion || "Could not get suggestion.");
          })

          .finally(() => {
            setIsLoadingSuggestion(false);
          });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setAiSuggestion("AI suggestions disabled. API Key missing.");

      setIsLoadingSuggestion(false);
    }
  }, [tasks]);

  useEffect(() => {
    /* Reminder Simulation */ let reminderTimeoutId = null;

    const checkReminders = () => {
      const now = new Date();

      const currentTimeStr = `${String(now.getHours()).padStart(
        2,

        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;

      let reminderTask = null;

      if (Array.isArray(tasks)) {
        tasks.forEach((task) => {
          if (
            task.time === currentTimeStr &&
            !task.completed &&
            !task.reminderShown
          ) {
            reminderTask = task;
          }
        });
      }

      if (reminderTask) {
        alert(`Reminder: ${reminderTask.title}`);

        setTasks((currentTasks) =>
          currentTasks.map((t) =>
            t.id === reminderTask.id ? { ...t, reminderShown: true } : t
          )
        );

        if (reminderTimeoutId) clearTimeout(reminderTimeoutId);

        reminderTimeoutId = setTimeout(() => {
          setTasks((currentTasks) =>
            currentTasks.map((t) => {
              if (t.id === reminderTask.id) {
                return { ...t, reminderShown: false };
              }

              return t;
            })
          );

          reminderTimeoutId = null;
        }, 60000);
      }
    };

    checkReminders();

    const intervalId = setInterval(checkReminders, 60000);

    return () => {
      clearInterval(intervalId);

      if (reminderTimeoutId) {
        clearTimeout(reminderTimeoutId);
      }
    };
  }, [tasks]);

  useEffect(() => {
    /* Scroll chat */ setTimeout(() => {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [chatHistory]);

  useEffect(() => {
    /* Update current time & active tasks */ const updateTime = () => {
      const now = new Date();

      const currentMinutesValue = timeToMinutes(
        `${now.getHours()}:${now.getMinutes()}`
      );

      setCurrentTimeMinutes(currentMinutesValue);

      const activeIds = tasks

        .filter((task) => {
          if (task.completed || !task.time) return false;

          const startMinutes = timeToMinutes(task.time);

          const endMinutes = task.endTime
            ? timeToMinutes(task.endTime)
            : startMinutes;

          if (startMinutes === null || endMinutes === null) return false;

          if (endMinutes < startMinutes) {
            return (
              currentMinutesValue >= startMinutes ||
              currentMinutesValue <= endMinutes
            );
          } else {
            return (
              currentMinutesValue >= startMinutes &&
              currentMinutesValue <= endMinutes
            );
          }
        })

        .map((task) => task.id);

      setActiveTaskIds(activeIds);
    };

    updateTime();

    const intervalId = setInterval(updateTime, 60000);

    return () => clearInterval(intervalId);
  }, [tasks]);

  // --- Task Management Callbacks ---

  const closeModal = useCallback(() => {
    setIsModalOpen(false);

    setEditingTask(null);

    setNewTaskTitle("");

    setNewTaskTime("");

    setNewTaskEndTime("");
  }, []);

  const upsertTask = useCallback(
    (taskDataOrArray) => {
      const tasksToProcess = Array.isArray(taskDataOrArray)
        ? taskDataOrArray
        : [taskDataOrArray];

      if (tasksToProcess.length === 0) return;

      const processedTasks = tasksToProcess

        .map((taskData) => ({
          id: taskData.id || Date.now() + Math.random(),

          title: (taskData.title || "").trim(),

          time: taskData.time || null,

          endTime: taskData.endTime || null,

          completed: taskData.completed || false,

          reminderShown: false,
        }))

        .filter((task) => task.title);

      if (processedTasks.length === 0) return;

      setTasks((prevTasks) => {
        const currentTasks = Array.isArray(prevTasks) ? prevTasks : [];

        let updatedTasks = [...currentTasks];

        processedTasks.forEach((newTask) => {
          const existingIndex = updatedTasks.findIndex(
            (t) => t.id === newTask.id
          );

          if (existingIndex > -1) {
            updatedTasks[existingIndex] = {
              ...updatedTasks[existingIndex],

              ...newTask,
            };
          } else {
            updatedTasks.push(newTask);
          }
        });

        updatedTasks.sort((a, b) => {
          const timeA = a.time ? timeToMinutes(a.time) : 99999;

          const timeB = b.time ? timeToMinutes(b.time) : 99999;

          if (timeA !== timeB) {
            return timeA - timeB;
          }

          return a.id - b.id;
        });

        return updatedTasks;
      });
    },

    [setTasks]
  );

  const handleModalAddTask = useCallback(() => {
    upsertTask({
      id: editingTask ? editingTask.id : undefined,

      title: newTaskTitle,

      time: newTaskTime,

      endTime: newTaskEndTime,

      completed: editingTask ? editingTask.completed : false,
    });

    closeModal();
  }, [
    upsertTask,

    editingTask,

    newTaskTitle,

    newTaskTime,

    newTaskEndTime,

    closeModal,
  ]);

  const findTaskIdByTitle = useCallback(
    (titleToFind) => {
      if (!titleToFind || !Array.isArray(tasks)) return null;

      const searchTerm = titleToFind.trim().toLowerCase();

      if (!searchTerm) return null;

      let foundTask = tasks.find(
        (task) => task.title.trim().toLowerCase() === searchTerm
      );

      if (foundTask) return foundTask.id;

      const includesMatches = tasks.filter((task) =>
        task.title.trim().toLowerCase().includes(searchTerm)
      );

      if (includesMatches.length === 1) return includesMatches[0].id;

      if (includesMatches.length > 1) {
        console.warn(
          `Multiple tasks match "${titleToFind}". Selecting first match: "${includesMatches[0].title}"`
        );

        return includesMatches[0].id;
      }

      return null;
    },

    [tasks]
  ); // Added warning for multiple matches

  const handleToggleComplete = useCallback(
    (id) => {
      if (!id) return;

      setTasks((currentTasks) => {
        if (!Array.isArray(currentTasks)) return [];

        return currentTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
      });
    },

    [setTasks]
  );

  const handleDeleteTask = useCallback(
    (id) => {
      if (!id) return;

      setTasks((prevTasks) =>
        Array.isArray(prevTasks)
          ? prevTasks.filter((task) => task.id !== id)
          : []
      );
    },

    [setTasks]
  );

  const openModalForEdit = useCallback((task) => {
    setEditingTask(task);

    setNewTaskTitle(task.title);

    setNewTaskTime(task.time || "");

    setNewTaskEndTime(task.endTime || "");

    setIsModalOpen(true);
  }, []);

  const openModalForNew = useCallback(() => {
    setEditingTask(null);

    setNewTaskTitle("");

    setNewTaskTime("");

    setNewTaskEndTime("");

    setIsModalOpen(true);
  }, []);

  const generateRecurringTasks = useCallback(
    (title, interval, startTimeStr, endTimeStr) => {
      const generated = [];

      const formatTime = (hour) => String(hour).padStart(2, "0") + ":00";

      let startHour;

      let endHour = 20;

      if (startTimeStr === null || startTimeStr === "now") {
        startHour = new Date().getHours();
      } else if (startTimeStr && startTimeStr.includes(":")) {
        startHour = parseInt(startTimeStr.split(":")[0], 10);
      } else {
        startHour = 8;
      }

      if (endTimeStr && endTimeStr.includes(":")) {
        endHour = parseInt(endTimeStr.split(":")[0], 10);
      } else {
        endHour = 20;
      }

      if (
        isNaN(startHour) ||
        isNaN(endHour) ||
        startHour < 0 ||
        startHour > 23 ||
        endHour < 0 ||
        endHour > 23
      ) {
        console.error("Invalid recurrence times:", startTimeStr, endTimeStr);

        return [];
      }

      if (interval === "hourly") {
        if (endHour < startHour) {
          for (let hour = startHour; hour <= 23; hour++) {
            const timeStr = formatTime(hour);

            generated.push({ title: title, time: timeStr, completed: false });
          }

          for (let hour = 0; hour <= endHour; hour++) {
            const timeStr = formatTime(hour);

            generated.push({ title: title, time: timeStr, completed: false });
          }
        } else {
          for (let hour = startHour; hour <= endHour; hour++) {
            const timeStr = formatTime(hour);

            generated.push({ title: title, time: timeStr, completed: false });
          }
        }
      } else if (interval === "daily") {
        generated.push({
          title: title,

          time: formatTime(startHour),

          completed: false,
        });
      } else {
        console.warn("Unsupported interval:", interval);
      }

      console.log("Generated Tasks:", generated);

      return generated;
    },

    []
  );

  // --- Chat Handling (Handles Suggest Tasks Confirmation, Delete Confirmation) ---

  const handleSendChatMessage = useCallback(async () => {
    const messageText = chatInput.trim();

    if (!messageText || isChatLoading) return;

    const newUserMessage = { sender: "user", text: messageText };

    setChatHistory((prev) => [...prev, newUserMessage]);

    setChatInput("");

    let requiresConfirmation = false;

    let chatMessageToAdd = "";

    try {
      // --- Confirmation Flow ---

      if (awaitingConfirmation && pendingActionData) {
        let confirmationResponse = "";

        const answer = messageText.toLowerCase();

        let resetConfirmationState = true;

        try {
          if (answer === "yes") {
            switch (pendingActionData.action) {
              case ACTION_ADD_RECURRING_TASK:

              case ACTION_SUGGEST_TASKS:
                upsertTask(pendingActionData.tasks);

                confirmationResponse = `Okay, added ${pendingActionData.tasks.length} task(s).`;

                break;

              case ACTION_COMPLETE_ALL_TASKS:

              case ACTION_COMPLETE_TASKS_UNTIL:

              case ACTION_COMPLETE_TASKS_MATCHING:
                if (
                  pendingActionData.taskIds &&
                  pendingActionData.taskIds.length > 0
                ) {
                  pendingActionData.taskIds.forEach((id) =>
                    handleToggleComplete(id)
                  );

                  confirmationResponse = `Okay, marked ${pendingActionData.taskIds.length} task(s) as complete.`;
                } else {
                  confirmationResponse = "No tasks found to modify.";
                }

                break;

              case ACTION_DELETE_TASK:

              case ACTION_DELETE_ALL_TASKS: // Combined delete confirmation
                if (
                  pendingActionData.taskIds &&
                  pendingActionData.taskIds.length > 0
                ) {
                  pendingActionData.taskIds.forEach((id) =>
                    handleDeleteTask(id)
                  );

                  confirmationResponse = `Okay, deleted ${pendingActionData.taskIds.length} task(s).`;
                } else {
                  confirmationResponse = "No tasks found to delete.";
                }

                break;

              default:
                confirmationResponse = "Action confirmed (unknown).";
            }
          } else if (answer === "no") {
            confirmationResponse = "Okay, action cancelled.";
          } else {
            confirmationResponse = `Please confirm: 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;

            resetConfirmationState = false;
          }
        } catch (error) {
          console.error("Error during confirmation:", error);

          confirmationResponse = "Error performing action.";

          resetConfirmationState = true;
        } finally {
          if (resetConfirmationState) {
            setPendingActionData(null);

            setAwaitingConfirmation(false);
          }
        }

        setChatHistory((prev) => [
          ...prev,

          { sender: "bot", text: confirmationResponse },
        ]);

        chatInputRef.current?.focus();

        return;
      }

      // --- Regular Chat / Action Handling ---

      setIsChatLoading(true);

      const currentChatHistory = [...chatHistory, newUserMessage];

      const botResponse = await fetchChatResponse(
        tasks,

        currentChatHistory,

        messageText,

        userName
      );

      if (botResponse.action) {
        let taskIdsToModify = [];

        let confirmationPrompt = "";

        switch (botResponse.action) {
          case ACTION_ADD_TASK:
            upsertTask({
              title: botResponse.title,

              time: botResponse.time,

              endTime: botResponse.endTime,
            });

            chatMessageToAdd = `Okay, I've added "${botResponse.title}" to your list.`;

            break; // Improved confirmation

          case ACTION_COMPLETE_TASK:

          case ACTION_COMPLETE_AND_DELETE_TASK:
            const completeTaskId = findTaskIdByTitle(botResponse.title);

            if (!completeTaskId) {
              chatMessageToAdd = `Sorry, I couldn't find the task "${botResponse.title}". Please be more specific.`;
            } else {
              const taskTitle =
                tasks.find((t) => t.id === completeTaskId)?.title ||
                botResponse.title;

              handleToggleComplete(completeTaskId);

              chatMessageToAdd = `Okay, marked "${taskTitle}" complete.`;

              if (botResponse.action === ACTION_COMPLETE_AND_DELETE_TASK) {
                setTimeout(() => handleDeleteTask(completeTaskId), 50);

                chatMessageToAdd += " And deleted it.";
              }
            }

            break;

          case ACTION_DELETE_TASK:
            const deleteTaskId = findTaskIdByTitle(botResponse.title);

            if (!deleteTaskId) {
              chatMessageToAdd = `Sorry, I couldn't find the task "${botResponse.title}". Please be more specific.`;
            } else {
              const taskTitle =
                tasks.find((t) => t.id === deleteTaskId)?.title ||
                botResponse.title;

              requiresConfirmation = true;

              confirmationPrompt = `Delete "${taskTitle}"? (yes/no)`;

              setPendingActionData({
                action: ACTION_DELETE_TASK,

                taskIds: [deleteTaskId],

                confirmationPrompt: confirmationPrompt,
              });
            }

            break;

          case ACTION_ADD_RECURRING_TASK:
            const generatedTasks = generateRecurringTasks(
              botResponse.title,

              botResponse.interval,

              botResponse.startTime,

              botResponse.endTime
            );

            if (generatedTasks.length > 0) {
              requiresConfirmation = true;

              confirmationPrompt = `AI proposes adding ${
                generatedTasks.length
              } "${botResponse.title}" tasks (${
                botResponse.interval || "interval"
              }). Add them? (yes/no)`;

              setPendingActionData({
                action: botResponse.action,

                tasks: generatedTasks,

                confirmationPrompt: confirmationPrompt,
              });
            } else {
              chatMessageToAdd = `Sorry, couldn't generate recurring tasks for "${botResponse.title}".`;
            }

            break;

          // *** Correctly handle suggest_tasks confirmation ***

          case ACTION_SUGGEST_TASKS:
            if (botResponse.tasks && botResponse.tasks.length > 0) {
              requiresConfirmation = true;

              confirmationPrompt = `AI suggests adding these tasks: ${botResponse.tasks

                .map((t) => t.title)

                .join(", ")}. Add them? (yes/no)`;

              setPendingActionData({
                action: botResponse.action,

                tasks: botResponse.tasks,

                confirmationPrompt: confirmationPrompt,
              });
            } else {
              chatMessageToAdd = "AI couldn't suggest tasks now.";
            }

            break;

          case ACTION_COMPLETE_ALL_TASKS:
            taskIdsToModify = tasks

              .filter((t) => !t.completed)

              .map((t) => t.id);

            if (taskIdsToModify.length > 0) {
              requiresConfirmation = true;

              confirmationPrompt = `Mark all ${taskIdsToModify.length} pending task(s) complete? (yes/no)`;

              setPendingActionData({
                action: botResponse.action,

                taskIds: taskIdsToModify,

                confirmationPrompt: confirmationPrompt,
              });
            } else {
              chatMessageToAdd = "No pending tasks.";
            }

            break;

          case ACTION_COMPLETE_TASKS_UNTIL:
            const targetTime = botResponse.time;

            if (targetTime && targetTime.includes(":")) {
              const targetMinutes = timeToMinutes(targetTime);

              taskIdsToModify = tasks

                .filter((t) => {
                  if (t.completed || !t.time) return false;

                  const taskMinutes = timeToMinutes(t.time);

                  return taskMinutes !== null && taskMinutes <= targetMinutes;
                })

                .map((t) => t.id);

              if (taskIdsToModify.length > 0) {
                requiresConfirmation = true;

                confirmationPrompt = `Mark ${taskIdsToModify.length} task(s) up to ${targetTime} complete? (yes/no)`;

                setPendingActionData({
                  action: botResponse.action,

                  taskIds: taskIdsToModify,

                  confirmationPrompt: confirmationPrompt,
                });
              } else {
                chatMessageToAdd = `No pending tasks found up to ${targetTime}.`;
              }
            } else {
              chatMessageToAdd = `Invalid time: "${targetTime}". Use HH:MM.`;
            }

            break;

          case ACTION_COMPLETE_TASKS_MATCHING:
            const pattern = botResponse.title_pattern;

            if (pattern) {
              taskIdsToModify = tasks

                .filter(
                  (t) =>
                    !t.completed &&
                    t.title.toLowerCase().includes(pattern.toLowerCase())
                )

                .map((t) => t.id);

              if (taskIdsToModify.length > 0) {
                requiresConfirmation = true;

                confirmationPrompt = `Mark ${taskIdsToModify.length} task(s) matching "${pattern}" complete? (yes/no)`;

                setPendingActionData({
                  action: botResponse.action,

                  taskIds: taskIdsToModify,

                  confirmationPrompt: confirmationPrompt,
                });
              } else {
                chatMessageToAdd = `No pending tasks found matching "${pattern}".`;
              }
            } else {
              chatMessageToAdd =
                "Sorry, I need a name pattern to complete matching tasks.";
            }

            break;

          case ACTION_DELETE_ALL_TASKS:
            taskIdsToModify = tasks.map((t) => t.id);

            if (taskIdsToModify.length > 0) {
              requiresConfirmation = true;

              confirmationPrompt = `Delete all ${taskIdsToModify.length} task(s)? This cannot be undone. (yes/no)`;

              setPendingActionData({
                action: botResponse.action,

                taskIds: taskIdsToModify,

                confirmationPrompt: confirmationPrompt,
              });
            } else {
              chatMessageToAdd = "There are no tasks to delete.";
            }

            break;

          default:
            chatMessageToAdd = botResponse.text || "Unknown action.";
        }

        if (requiresConfirmation) chatMessageToAdd = confirmationPrompt;
      } else {
        if (
          messageText.toLowerCase().startsWith("im ") ||
          messageText.toLowerCase().startsWith("i'm ") ||
          messageText.toLowerCase().startsWith("my name is ")
        ) {
          const potentialName = messageText

            .split(" ")

            .slice(-1)[0]
            .replace(/[^a-zA-Z]/g, "");

          if (potentialName) {
            const name =
              potentialName.charAt(0).toUpperCase() + potentialName.slice(1);

            setUserName(name);

            chatMessageToAdd = `Nice to meet you, ${name}! How can I help?`;
          } else {
            chatMessageToAdd = botResponse.text;
          }
        } else {
          chatMessageToAdd = botResponse.text;
        }
      }
    } catch (error) {
      console.error("Error processing chat:", error);

      chatMessageToAdd = "Sorry, error processing request.";
    } finally {
      setIsChatLoading(false);

      if (chatMessageToAdd) {
        setChatHistory((prev) => [
          ...prev,

          { sender: "bot", text: chatMessageToAdd },
        ]);
      }

      if (requiresConfirmation) {
        setAwaitingConfirmation(true);
      }

      setTimeout(() => chatInputRef.current?.focus(), 0);
    }
  }, [
    chatInput,

    chatHistory,

    tasks,

    isChatLoading,

    upsertTask,

    findTaskIdByTitle,

    handleToggleComplete,

    handleDeleteTask,

    awaitingConfirmation,

    pendingActionData,

    generateRecurringTasks,

    userName,
  ]);

  const handleChatInputKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSendChatMessage();
    }
  };

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // --- Voice Input Logic ---

  const setupSpeechRecognition = useCallback(
    () => {
      /* ... */ const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn("Speech Recognition not supported.");

        return;
      }

      const recognition = new SpeechRecognition();

      recognition.continuous = false;

      recognition.interimResults = false;

      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);

        console.log("Voice started.");
      };

      recognition.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript.trim();

        console.log("Voice transcript:", transcript);

        setChatInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech error:", event.error);

        let errorMsg = `Speech error: ${event.error}`;

        if (event.error === "not-allowed") {
          errorMsg = "Mic permission denied.";
        } else if (event.error === "no-speech") {
          errorMsg = "No speech detected.";
        }

        setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);

        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("Voice ended.");

        setIsListening(false);

        chatInputRef.current?.focus();
      };

      recognitionRef.current = recognition;
    },

    [
      /* setChatHistory */
    ]
  ); // Added setChatHistory dependency if used in error handling

  useEffect(() => {
    setupSpeechRecognition();

    return () => {
      recognitionRef.current?.abort();
    };
  }, [setupSpeechRecognition]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      navigator.mediaDevices

        .getUserMedia({ audio: true })

        .then(() => {
          recognitionRef.current?.start();
        })

        .catch((err) => {
          console.error("Mic access denied:", err);

          setChatHistory((prev) => [
            ...prev,

            { sender: "bot", text: "Mic access denied." },
          ]);
        });
    }
  };

  // --- Memoized Values ---

  const sortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    return [...tasks].sort((a, b) => {
      const timeA = a.time ? timeToMinutes(a.time) : 99999;

      const timeB = b.time ? timeToMinutes(b.time) : 99999;

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      return a.id - b.id;
    });
  }, [tasks]);

  const completedTasksCount = useMemo(
    () =>
      Array.isArray(tasks) ? tasks.filter((task) => task.completed).length : 0,

    [tasks]
  );

  const pendingTasksCount = useMemo(
    () => (Array.isArray(tasks) ? tasks.length : 0) - completedTasksCount,

    [tasks, completedTasksCount]
  );

  const tasksByTimeSlot = useMemo(() => {
    const slots = {
      "Morning (Before 12 PM)": [],

      "Afternoon (12 PM - 5 PM)": [],

      "Evening (After 5 PM)": [],

      "Anytime / Unscheduled": [],
    };

    if (Array.isArray(sortedTasks)) {
      sortedTasks.forEach((task) => {
        if (task.time) {
          const hour = parseInt(task.time.split(":")[0]);

          if (hour < 12) slots["Morning (Before 12 PM)"].push(task);
          else if (hour < 17) slots["Afternoon (12 PM - 5 PM)"].push(task);
          else slots["Evening (After 5 PM)"].push(task);
        } else {
          slots["Anytime / Unscheduled"].push(task);
        }
      });
    }

    return slots;
  }, [sortedTasks]);

  const AiIconComponent = isLoadingSuggestion ? Zap : Brain;

  // --- Render JSX ---

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans text-gray-800 overflow-hidden">
      {/* Header */}

      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {" "}
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {" "}
            My Day Planner Pro{" "}
          </h1>{" "}
          <div className="flex items-center space-x-2 md:space-x-4">
            {" "}
            <div className="text-right hidden sm:block">
              {" "}
              <p className="text-sm font-medium text-gray-700">
                {getGreeting()}, {userName}!
              </p>{" "}
              <p className="text-xs text-gray-500">
                {" "}
                {currentDate.toLocaleDateString(undefined, {
                  weekday: "long",

                  month: "long",

                  day: "numeric",
                })}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      </header>

      {/* Main Content Area */}

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden relative">
        {/* Left Column */}

        <div className="lg:col-span-2 space-y-4 md:space-y-6 overflow-y-auto pr-1 md:pr-2">
          {/* Snapshot Card */}

          <Card className="bg-white/70">
            <CardHeader>
              {" "}
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap size={20} className="text-yellow-500" /> Today's Snapshot
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {" "}
              <div className="space-y-1">
                {" "}
                <p className="text-sm text-gray-600">
                  Pending:{" "}
                  <span className="font-semibold text-orange-600">
                    {pendingTasksCount}
                  </span>
                </p>{" "}
                <p className="text-sm text-gray-600">
                  Completed:{" "}
                  <span className="font-semibold text-green-600">
                    {completedTasksCount}
                  </span>
                </p>{" "}
              </div>{" "}
              <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg flex items-center gap-2 shadow-sm border border-blue-200 flex-1 min-w-0">
                {" "}
                <AiIconComponent
                  size={20}
                  className={`flex-shrink-0 text-blue-600 ${
                    isLoadingSuggestion ? "animate-pulse" : ""
                  }`}
                />{" "}
                <span className="italic whitespace-pre-line text-xs sm:text-sm">
                  {" "}
                  {isLoadingSuggestion
                    ? "Getting suggestion..."
                    : aiSuggestion}{" "}
                </span>{" "}
              </div>{" "}
            </CardContent>{" "}
            <CardFooter>
              {" "}
              <Button
                onClick={openModalForNew}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {" "}
                <Plus size={18} className="mr-2" /> Add New Task{" "}
              </Button>{" "}
            </CardFooter>
          </Card>

          {/* Task List Card */}

          <Card className="bg-white/70">
            <CardHeader>
              {" "}
              <CardTitle className="text-lg">Your Tasks</CardTitle>{" "}
              <CardDescription>Manage your daily tasks.</CardDescription>{" "}
            </CardHeader>

            <CardContent>
              {tasks && tasks.length > 0 ? (
                <ul className="space-y-3">
                  {" "}
                  {sortedTasks.map((task) => {
                    const isActive = activeTaskIds.includes(task.id);

                    const isCompleted = task.completed;

                    return (
                      <li
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ease-in-out group ${
                          isCompleted
                            ? "bg-green-50 border-green-200 opacity-60"
                            : ""
                        } ${
                          isActive && !isCompleted
                            ? "bg-yellow-50 border-yellow-300 shadow-sm"
                            : ""
                        } ${
                          !isActive && !isCompleted
                            ? "bg-white border-gray-200 hover:bg-gray-50"
                            : ""
                        } `}
                      >
                        {" "}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {" "}
                          <Checkbox
                            checked={isCompleted}
                            onChange={() => handleToggleComplete(task.id)}
                            id={`task-check-${task.id}`}
                            className="cursor-pointer flex-shrink-0"
                          />{" "}
                          <label
                            htmlFor={`task-check-${task.id}`}
                            className={`flex-1 min-w-0 cursor-pointer ${
                              isCompleted
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {" "}
                            <span
                              className={`font-medium block truncate text-sm md:text-base ${
                                isActive && !isCompleted
                                  ? "text-yellow-800"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </span>{" "}
                            {(task.time || task.endTime) && (
                              <span className="text-xs text-blue-600 flex items-center gap-1">
                                {" "}
                                <Clock size={12} /> {task.time}
                                {task.endTime ? ` - ${task.endTime}` : ""}{" "}
                              </span>
                            )}{" "}
                          </label>{" "}
                        </div>{" "}
                        <div className="flex items-center space-x-1 md:space-x-2 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {" "}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-blue-600 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();

                              openModalForEdit(task);
                            }}
                          >
                            {" "}
                            <Edit size={16} />{" "}
                            <span className="sr-only">Edit</span>{" "}
                          </Button>{" "}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-600 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDeleteTask(task.id);
                            }}
                          >
                            {" "}
                            <Trash2 size={16} />{" "}
                            <span className="sr-only">Delete</span>{" "}
                          </Button>{" "}
                        </div>{" "}
                      </li>
                    );
                  })}{" "}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No tasks added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}

        <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col overflow-y-auto pr-1 md:pr-2">
          {/* Daily Schedule Card */}
          <Card className="bg-white/70 flex-shrink-0">
            <CardHeader>
              {" "}
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon size={20} className="text-purple-600" /> Daily
                Schedule
              </CardTitle>{" "}
              <CardDescription>Your day at a glance.</CardDescription>{" "}
            </CardHeader>

            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {tasks && tasks.length > 0 ? (
                Object.entries(tasksByTimeSlot).map(
                  ([slot, slotTasks]) =>
                    slotTasks.length > 0 && (
                      <div key={slot}>
                        {" "}
                        <h4 className="font-semibold text-sm mb-2 text-gray-600 flex items-center gap-1.5">
                          {" "}
                          {slot.includes("Morning") && (
                            <Sun size={16} className="text-yellow-500" />
                          )}{" "}
                          {slot.includes("Afternoon") && (
                            <Coffee size={16} className="text-amber-700" />
                          )}{" "}
                          {slot.includes("Evening") && (
                            <Moon size={16} className="text-blue-800" />
                          )}{" "}
                          {!slot.includes("Morning") &&
                            !slot.includes("Afternoon") &&
                            !slot.includes("Evening") && (
                              <Clock size={16} className="text-gray-500" />
                            )}{" "}
                          {slot}{" "}
                        </h4>{" "}
                        <ul className="space-y-2 pl-4 border-l-2 border-blue-200">
                          {" "}
                          {slotTasks.map((task) => {
                            const isActive = activeTaskIds.includes(task.id);

                            const isCompleted = task.completed;

                            return (
                              <li
                                key={task.id}
                                className={`text-sm flex items-start gap-2 ${
                                  isCompleted
                                    ? "text-gray-400 line-through italic"
                                    : "text-gray-700"
                                } ${
                                  isActive && !isCompleted
                                    ? "font-medium text-yellow-700"
                                    : ""
                                }`}
                              >
                                {" "}
                                <span
                                  className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
                                    isCompleted
                                      ? "bg-green-400"
                                      : isActive
                                      ? "bg-yellow-500"
                                      : "bg-gray-400"
                                  }`}
                                ></span>{" "}
                                <div>
                                  {" "}
                                  <span className="truncate">
                                    {task.title}
                                  </span>{" "}
                                  {task.time && (
                                    <span className="ml-1 text-xs text-blue-500">
                                      ({task.time}
                                      {task.endTime ? `-${task.endTime}` : ""})
                                    </span>
                                  )}{" "}
                                </div>{" "}
                              </li>
                            );
                          })}{" "}
                        </ul>{" "}
                      </div>
                    )
                )
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Your schedule is empty.
                </p>
              )}{" "}
            </CardContent>
          </Card>
          <div className="flex-grow"></div> {/* Pushes schedule card up */}
        </div>

        {/* --- Floating Action Button for Chat --- */}

        {!isChatOpen && (
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            {" "}
            <MessageSquare size={24} />{" "}
            <span className="sr-only">Open Chat</span>{" "}
          </Button>
        )}
      </main>

      {/* Chat Window */}

      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={toggleChat}
          ></div>

          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
              isChatOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
              <CardHeader className="flex-shrink-0 border-b flex items-center justify-between">
                {" "}
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare size={20} className="text-indigo-600" /> Chat
                  Assistant
                </CardTitle>{" "}
                <Button onClick={toggleChat} variant="ghost" size="icon">
                  {" "}
                  <X size={20} /> <span className="sr-only">Close Chat</span>{" "}
                </Button>{" "}
              </CardHeader>

              <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative">
                {chatHistory.length === 0 && !isChatLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {" "}
                    <p className="text-gray-400 italic text-center px-4">
                      How can I help you plan your day, {userName}?
                    </p>{" "}
                  </div>
                )}

                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    {" "}
                    {msg.sender === "bot" && (
                      <Bot
                        size={18}
                        className="text-indigo-500 flex-shrink-0 mt-1"
                      />
                    )}{" "}
                    <div
                      className={`p-2.5 rounded-lg max-w-[85%] ${
                        msg.sender === "user"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {" "}
                      <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                        {msg.text}
                      </ReactMarkdown>{" "}
                    </div>{" "}
                    {msg.sender === "user" && (
                      <User
                        size={18}
                        className="text-blue-500 flex-shrink-0 mt-1"
                      />
                    )}{" "}
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex items-start gap-2.5">
                    {" "}
                    <Bot
                      size={18}
                      className="text-indigo-500 flex-shrink-0 mt-1 animate-pulse"
                    />{" "}
                    <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500 italic">
                      {" "}
                      Assistant is thinking...{" "}
                    </div>{" "}
                  </div>
                )}

                <div ref={chatMessagesEndRef} />
              </CardContent>

              <CardFooter className="border-t pt-4 pb-4 px-4 bg-white flex-shrink-0">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    ref={chatInputRef}
                    type="text"
                    placeholder={
                      isListening ? "Listening..." : "Type or use mic..."
                    }
                    className="flex-1"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatInputKeyPress}
                    disabled={isChatLoading}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMicClick}
                    disabled={isChatLoading}
                    className={`text-gray-500 hover:text-indigo-600 ${
                      isListening ? "text-red-500 hover:text-red-600" : ""
                    }`}
                    title={isListening ? "Stop Listening" : "Start Listening"}
                  >
                    {" "}
                    {isListening ? (
                      <MicOff size={18} />
                    ) : (
                      <Mic size={18} />
                    )}{" "}
                  </Button>

                  <Button
                    size="icon"
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {" "}
                    <Send size={18} />{" "}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      {/* Add/Edit Task Modal */}

      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogContent>
          <DialogHeader>
            {" "}
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>{" "}
          </DialogHeader>

          <div className="space-y-4">
            <div>
              {" "}
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Title
              </label>{" "}
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="E.g., Meeting with team"
                className="w-full"
                autoFocus
              />{" "}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                {" "}
                <label
                  htmlFor="task-time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time (Optional)
                </label>{" "}
                <Input
                  id="task-time"
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full"
                />{" "}
              </div>

              <div>
                {" "}
                <label
                  htmlFor="task-endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time (Optional)
                </label>{" "}
                <Input
                  id="task-endTime"
                  type="time"
                  value={newTaskEndTime}
                  onChange={(e) => setNewTaskEndTime(e.target.value)}
                  className="w-full"
                />{" "}
              </div>
            </div>
          </div>

          <DialogFooter>
            {" "}
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>{" "}
            <Button
              onClick={handleModalAddTask}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {" "}
              {editingTask ? "Save Changes" : "Add Task"}{" "}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
