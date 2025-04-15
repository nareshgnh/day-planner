// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";

// import ReactMarkdown from "react-markdown";

// import {
//   Calendar as CalendarIcon,
//   Plus,
//   Trash2,
//   Edit,
//   Check,
//   Clock,
//   Zap,
//   Coffee,
//   Brain,
//   Moon,
//   Sun,
//   Award,
//   TrendingUp,
//   Wind,
//   MessageSquare,
//   Send,
//   User,
//   Bot,
//   X,
//   Menu,
//   PlayCircle,
//   PauseCircle,
//   CheckCircle,
//   Mic,
//   MicOff,
// } from "lucide-react";

// // --- IMPORTANT SECURITY WARNING ---

// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// // --- Action Constants ---

// const ACTION_ADD_TASK = "add_task";

// const ACTION_ADD_RECURRING_TASK = "add_recurring_task";

// const ACTION_COMPLETE_TASK = "complete_task";

// const ACTION_DELETE_TASK = "delete_task";

// const ACTION_COMPLETE_AND_DELETE_TASK = "complete_and_delete_task";

// const ACTION_COMPLETE_ALL_TASKS = "complete_all_tasks";

// const ACTION_COMPLETE_TASKS_UNTIL = "complete_tasks_until";

// const ACTION_SUGGEST_TASKS = "suggest_tasks";

// const ACTION_COMPLETE_TASKS_MATCHING = "complete_tasks_matching";

// const ACTION_DELETE_ALL_TASKS = "delete_all_tasks";

// // --- Helper: Time Conversion ---

// const timeToMinutes = (timeStr) => {
//   /* ... */ if (!timeStr || !timeStr.includes(":")) return null;

//   const [hours, minutes] = timeStr.split(":").map(Number);

//   if (isNaN(hours) || isNaN(minutes)) return null;

//   return hours * 60 + minutes;
// };

// // Mock shadcn/ui components

// const Button = ({
//   children,

//   variant = "default",

//   size = "default",

//   className = "",

//   ...props
// }) => {
//   /* ... */ const baseStyle =
//     "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

//   const variants = {
//     default: "bg-blue-600 text-white hover:bg-blue-600/90",

//     destructive: "bg-red-600 text-white hover:bg-red-600/90",

//     outline:
//       "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900",

//     secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80",

//     ghost: "hover:bg-gray-100 hover:text-gray-900",

//     link: "text-blue-600 underline-offset-4 hover:underline",
//   };

//   const sizes = {
//     default: "h-10 px-4 py-2",

//     sm: "h-9 rounded-md px-3",

//     lg: "h-11 rounded-md px-8",

//     icon: "h-10 w-10",
//   };

//   return (
//     <button
//       className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// const Input = ({ className = "", type = "text", ...props }) => (
//   <input
//     type={type}
//     className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//     {...props}
//   />
// );

// const Checkbox = ({ className = "", ...props }) => (
//   <input
//     type="checkbox"
//     className={`h-4 w-4 shrink-0 rounded-sm border border-gray-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:text-white ${className}`}
//     {...props}
//   />
// );

// const Card = ({ children, className = "", ...props }) => (
//   <div
//     className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );

// const CardHeader = ({ children, className = "", ...props }) => (
//   <div
//     className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );

// const CardTitle = ({ children, className = "", as = "h3", ...props }) => {
//   const Tag = as;

//   return (
//     <Tag
//       className={`text-lg font-semibold leading-none tracking-tight ${className}`}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };

// const CardDescription = ({ children, className = "", ...props }) => (
//   <p className={`text-sm text-gray-500 ${className}`} {...props}>
//     {children}
//   </p>
// );

// const CardContent = ({ children, className = "", ...props }) => (
//   <div className={`p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );

// const CardFooter = ({ children, className = "", ...props }) => (
//   <div className={`flex items-center p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );

// const Dialog = ({ open, onClose, children }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       {" "}
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto">
//         {" "}
//         {children}{" "}
//       </div>{" "}
//     </div>
//   );
// };

// const DialogContent = ({ children, className = "", ...props }) => (
//   <div className={`p-6 ${className}`} {...props}>
//     {children}
//   </div>
// );

// const DialogHeader = ({ children, className = "", ...props }) => (
//   <div className={`mb-4 ${className}`} {...props}>
//     {children}
//   </div>
// );

// const DialogTitle = ({ children, className = "", as = "h2", ...props }) => {
//   const Tag = as;

//   return (
//     <Tag className={`text-lg font-semibold ${className}`} {...props}>
//       {children}
//     </Tag>
//   );
// };

// const DialogFooter = ({ children, className = "", ...props }) => (
//   <div
//     className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );

// // Helper function to get greeting based on time

// const getGreeting = () => {
//   const hour = new Date().getHours();

//   if (hour < 12) return "Good Morning";

//   if (hour < 18) return "Good Afternoon";

//   return "Good Evening";
// };

// // --- Function to call Gemini API for MOTIVATION ---

// async function fetchMotivationSuggestion(taskList) {
//   /* ... (remains same) ... */

//   if (!GEMINI_API_KEY) return "API Key missing.";

//   if (
//     !GEMINI_API_ENDPOINT.includes("key=" + GEMINI_API_KEY) ||
//     !GEMINI_API_ENDPOINT.startsWith("https://")
//   )
//     return "API Endpoint config error.";

//   const pendingTasks = taskList.filter((t) => !t.completed);

//   const completedTasks = taskList.filter((t) => t.completed);

//   let prompt = `You are a motivational assistant for a day planner app. The user has ${
//     pendingTasks.length
//   } pending tasks and ${
//     completedTasks.length
//   } completed tasks. Current time is ${new Date().toLocaleTimeString()}. `;

//   if (pendingTasks.length > 0) {
//     prompt += `Pending tasks are: ${pendingTasks

//       .map((t) => t.title)

//       .join(", ")}. `;
//   } else {
//     prompt += "All tasks are completed or there are no tasks. ";
//   }

//   prompt +=
//     "First, provide a short (1-2 sentences), encouraging, and context-aware motivational message. Then, on a new line, provide a short, relevant motivational quote prefixed with 'Quote:'.";

//   const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

//   console.log("Sending motivation prompt:", prompt);

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",

//       headers: { "Content-Type": "application/json" },

//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;

//       try {
//         const errorJson = await response.json();

//         errorBody = JSON.stringify(errorJson);
//       } catch (e) {}

//       console.error("Gemini API Error:", errorBody);

//       throw new Error(`API request failed: ${response.status}`);
//     }

//     const data = await response.json();

//     const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!suggestionText) {
//       console.error("Could not parse suggestion text:", data);

//       return "Could not parse suggestion.";
//     }

//     console.log("Received motivation response:", suggestionText);

//     return suggestionText.trim();
//   } catch (error) {
//     console.error("Error fetching motivation:", error);

//     if (error.message.includes("Failed to fetch")) return "Network/CORS error.";

//     return `Error: ${error.message}`;
//   }
// }

// // --- Function to call Gemini API for CHAT (Further Improved Instructions) ---

// async function fetchChatResponse(taskList, chatHistory, userMessage, userName) {
//   if (!GEMINI_API_KEY) return { text: "API Key missing." };

//   if (
//     !GEMINI_API_ENDPOINT.includes("key=" + GEMINI_API_KEY) ||
//     !GEMINI_API_ENDPOINT.startsWith("https://")
//   )
//     return { text: "API Endpoint config error." };

//   // --- Updated Prompt Instructions ---

//   // *** UPDATED Persona and Scope ***

//   let prompt = `You are ${userName}'s friendly, encouraging, and helpful AI assistant integrated into their day planner app. Be concise and helpful. Format your response using simple Markdown. \n`;

//   prompt += `Your primary goal is to help manage tasks (add, complete, delete, suggest). You can also provide brief motivational quotes or answer simple general knowledge questions if asked directly, but always gently steer back to planner tasks.\n`;

//   prompt += `IMPORTANT ACTION INSTRUCTIONS:\n`;

//   // *** UPDATED: Emphasize core title extraction ***

//   prompt += `- ADD SINGLE task: If user asks to add ONE task (e.g., "add task to buy milk at 3pm", "add drink water"), extract the **CORE task title** (e.g., "Buy Milk", "Drink Water"), start time (HH:MM), and end time (HH:MM). Respond ONLY with JSON: {"action": "${ACTION_ADD_TASK}", "title": "Core Task Title", "time": "HH:MM" or null, "endTime": "HH:MM" or null}\n`;

//   prompt += `- ADD MULTIPLE DISTINCT tasks: If user lists multiple different tasks at once, **ask them to add each task individually for now.**\n`;

//   prompt += `- ADD RECURRING task: Extract core title, interval ("hourly", "daily"), start/end times (HH:MM). If start is "now", use null startTime. Default 8am-8pm hourly. Respond ONLY with JSON: {"action": "${ACTION_ADD_RECURRING_TASK}", "title": "Core Title", "interval": "hourly" or "daily", "startTime": "HH:MM" or null, "endTime": "HH:MM" or null}\n`;

//   prompt += `- SUGGEST TASKS: If user asks for tasks on a topic, suggest 2-3 relevant tasks. Respond ONLY with JSON: {"action": "${ACTION_SUGGEST_TASKS}", "tasks": [{"title": "...", "time": "HH:MM" or null, "endTime": "HH:MM" or null}, ...]}\n`;

//   // *** UPDATED: Emphasize exact title & overlap check ***

//   prompt += `- COMPLETE/DELETE/COMPLETE&DELETE task: Identify the **exact task title** from the user message or task list. If ambiguous, ask for clarification. If adding/modifying results in a time overlap, point it out and ask how to proceed (e.g., "Adding Task X overlaps Task Y. Add anyway?"). Respond ONLY with JSON containing action ("${ACTION_COMPLETE_TASK}", "${ACTION_DELETE_TASK}", "${ACTION_COMPLETE_AND_DELETE_TASK}") and "title".\n`;

//   prompt += `- COMPLETE ALL tasks: ONLY if user says "complete ALL tasks" without specifying a name. Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_ALL_TASKS}"}\n`;

//   prompt += `- COMPLETE MULTIPLE tasks by name: If user asks to complete multiple tasks matching a name, identify the core title pattern. Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_TASKS_MATCHING}", "title_pattern": "Core Title Pattern"}\n`;

//   prompt += `- COMPLETE UNTIL time: Respond ONLY with JSON: {"action": "${ACTION_COMPLETE_TASKS_UNTIL}", "time": "HH:MM"}\n`;

//   prompt += `- DELETE ALL tasks: ONLY if user says "delete ALL tasks". Respond ONLY with JSON: {"action": "${ACTION_DELETE_ALL_TASKS}"}\n`;

//   // *** NEW: Update Task Limitation ***

//   prompt += `- UPDATE TASK: You cannot update existing tasks yet. Inform the user politely if they ask to update a task.\n`;

//   prompt += `- Respond ONLY with the JSON structure when performing an action. No extra text.\n`;

//   prompt += `- For all other conversation, respond normally and be friendly.\n`;

//   prompt += `\nCurrent tasks: \n`;

//   if (taskList.length > 0) {
//     taskList.forEach((task) => {
//       prompt += `- ${task.title} (${
//         task.completed ? "Completed" : "Pending"
//       }) ${task.time ? " at " + task.time : ""}${
//         task.endTime ? " until " + task.endTime : ""
//       }\n`;
//     });
//   } else {
//     prompt += `- No tasks today.\n`;
//   }

//   prompt += `\nConversation History:\n`;

//   const recentHistory = chatHistory.slice(-6);

//   recentHistory.forEach((msg) => {
//     prompt += `${msg.sender === "user" ? userName : "Assistant"}: ${
//       msg.text
//     }\n`;
//   }); // Use userName in history

//   prompt += `${userName}: ${userMessage}\nAssistant:`;

//   const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

//   console.log("Sending chat prompt:", prompt);

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",

//       headers: { "Content-Type": "application/json" },

//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;

//       try {
//         const errorJson = await response.json();

//         errorBody = JSON.stringify(errorJson);
//       } catch (e) {
//         /* ignore */
//       }

//       console.error("Gemini API Error:", errorBody);

//       throw new Error(`API request failed: ${response.status}`);
//     }

//     const data = await response.json();

//     const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!chatResponseText) {
//       console.error("Could not parse chat response:", data);

//       return { text: "Could not parse response." };
//     }

//     console.log("Received chat response:", chatResponseText);

//     // --- Parsing Logic ---

//     let actionData = null;

//     const possibleActions = [
//       ACTION_ADD_TASK,

//       ACTION_ADD_RECURRING_TASK,

//       ACTION_COMPLETE_TASK,

//       ACTION_DELETE_TASK,

//       ACTION_COMPLETE_AND_DELETE_TASK,

//       ACTION_COMPLETE_ALL_TASKS,

//       ACTION_COMPLETE_TASKS_UNTIL,

//       ACTION_SUGGEST_TASKS,

//       ACTION_COMPLETE_TASKS_MATCHING,

//       ACTION_DELETE_ALL_TASKS,
//     ];

//     const singleTaskActions = [
//       ACTION_ADD_TASK,

//       ACTION_COMPLETE_TASK,

//       ACTION_DELETE_TASK,

//       ACTION_COMPLETE_AND_DELETE_TASK,
//     ];

//     const bulkTimeActions = [ACTION_COMPLETE_TASKS_UNTIL];

//     const bulkMatchingActions = [ACTION_COMPLETE_TASKS_MATCHING];

//     const noParamActions = [ACTION_COMPLETE_ALL_TASKS, ACTION_DELETE_ALL_TASKS];

//     try {
//       const potentialJson = JSON.parse(chatResponseText);

//       if (
//         potentialJson.action &&
//         possibleActions.includes(potentialJson.action)
//       ) {
//         if (
//           singleTaskActions.includes(potentialJson.action) &&
//           potentialJson.title
//         )
//           actionData = potentialJson;
//         else if (
//           potentialJson.action === ACTION_ADD_RECURRING_TASK &&
//           potentialJson.title &&
//           potentialJson.interval
//         )
//           actionData = potentialJson;
//         else if (
//           bulkTimeActions.includes(potentialJson.action) &&
//           potentialJson.time
//         )
//           actionData = potentialJson;
//         else if (
//           potentialJson.action === ACTION_SUGGEST_TASKS &&
//           Array.isArray(potentialJson.tasks)
//         )
//           actionData = potentialJson;
//         else if (
//           bulkMatchingActions.includes(potentialJson.action) &&
//           potentialJson.title_pattern
//         )
//           actionData = potentialJson;
//         else if (noParamActions.includes(potentialJson.action))
//           actionData = potentialJson;
//       }
//     } catch (e) {
//       const jsonRegex = /\{[\s\S]*?\"action\"\s*:\s*\"([_a-zA-Z]+)\"[\s\S]*?\}/;

//       const match = chatResponseText.match(jsonRegex);

//       if (match && match[0]) {
//         try {
//           const extractedJson = JSON.parse(match[0]);

//           if (
//             extractedJson.action &&
//             possibleActions.includes(extractedJson.action)
//           ) {
//             if (
//               singleTaskActions.includes(extractedJson.action) &&
//               extractedJson.title
//             )
//               actionData = extractedJson;
//             else if (
//               extractedJson.action === ACTION_ADD_RECURRING_TASK &&
//               extractedJson.title &&
//               extractedJson.interval
//             )
//               actionData = extractedJson;
//             else if (
//               bulkTimeActions.includes(extractedJson.action) &&
//               extractedJson.time
//             )
//               actionData = extractedJson;
//             else if (
//               extractedJson.action === ACTION_SUGGEST_TASKS &&
//               Array.isArray(extractedJson.tasks)
//             )
//               actionData = extractedJson;
//             else if (
//               bulkMatchingActions.includes(extractedJson.action) &&
//               extractedJson.title_pattern
//             )
//               actionData = extractedJson;
//             else if (noParamActions.includes(extractedJson.action))
//               actionData = extractedJson;

//             if (actionData)
//               console.log("Extracted action JSON via regex:", actionData);
//           }
//         } catch (parseError) {
//           console.warn(
//             "Found potential JSON action, failed parse:",

//             parseError
//           );
//         }
//       }
//     }

//     if (actionData) {
//       actionData.title = actionData.title || null;

//       actionData.time = actionData.time || null;

//       actionData.endTime = actionData.endTime || null;

//       actionData.startTime = actionData.startTime || null;

//       actionData.interval = actionData.interval || null;

//       actionData.tasks = actionData.tasks || null;

//       actionData.title_pattern = actionData.title_pattern || null;

//       return actionData;
//     } else {
//       return { text: chatResponseText.trim() };
//     }
//   } catch (error) {
//     console.error("Error fetching chat response:", error);

//     if (error.message.includes("Failed to fetch"))
//       return { text: "Network/CORS error." };

//     return { text: `Error: ${error.message}` };
//   }
// }

// // Main App Component

// function App() {
//   // --- State Definitions ---

//   const [tasks, setTasks] = useState([]);

//   const [newTaskTitle, setNewTaskTitle] = useState("");

//   const [newTaskTime, setNewTaskTime] = useState("");

//   const [newTaskEndTime, setNewTaskEndTime] = useState("");

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [editingTask, setEditingTask] = useState(null);

//   const [currentDate] = useState(new Date());

//   const [currentTimeMinutes, setCurrentTimeMinutes] = useState(
//     timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`)
//   );

//   const [activeTaskIds, setActiveTaskIds] = useState([]);

//   const [aiSuggestion, setAiSuggestion] = useState("Loading suggestion...");

//   const [aiIcon, setAiIcon] = useState(Brain);

//   const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

//   const [chatHistory, setChatHistory] = useState([]);

//   const [chatInput, setChatInput] = useState("");

//   const [isChatLoading, setIsChatLoading] = useState(false);

//   const [isChatOpen, setIsChatOpen] = useState(false);

//   const chatMessagesEndRef = useRef(null);

//   const chatInputRef = useRef(null);

//   const [pendingActionData, setPendingActionData] = useState(null);

//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

//   const [userName, setUserName] = useState("User");

//   const recognitionRef = useRef(null);

//   const [isListening, setIsListening] = useState(false);

//   // --- Effects ---

//   useEffect(() => {
//     /* Load tasks & name */ try {
//       const storedTasks = localStorage.getItem("dayPlannerTasks");

//       if (storedTasks) {
//         const parsedTasks = JSON.parse(storedTasks);

//         setTasks(
//           parsedTasks.map((task) => ({
//             ...task,

//             completed: task.completed || false,
//           }))
//         );
//       } else {
//         setTasks([]);
//       }

//       const storedName = localStorage.getItem("dayPlannerUserName");

//       if (storedName) {
//         setUserName(storedName);

//         console.log("Loaded name:", storedName);
//       }
//     } catch (error) {
//       console.error("Failed load tasks/name:", error);

//       localStorage.removeItem("dayPlannerTasks");

//       localStorage.removeItem("dayPlannerUserName");

//       setTasks([]);
//     }
//   }, []);

//   useEffect(() => {
//     /* Save tasks */ if (
//       tasks.length > 0 ||
//       localStorage.getItem("dayPlannerTasks") !== null
//     ) {
//       try {
//         localStorage.setItem("dayPlannerTasks", JSON.stringify(tasks));
//       } catch (error) {
//         console.error("Failed save tasks:", error);
//       }
//     }
//   }, [tasks]);

//   useEffect(() => {
//     /* Save Name */ if (userName !== "User") {
//       try {
//         localStorage.setItem("dayPlannerUserName", userName);

//         console.log("Saved name:", userName);
//       } catch (error) {
//         console.error("Failed save name:", error);
//       }
//     }
//   }, [userName]);

//   useEffect(() => {
//     /* Fetch Suggestion */ if (GEMINI_API_KEY) {
//       setIsLoadingSuggestion(true);

//       setAiIcon(() => Brain);

//       const timer = setTimeout(() => {
//         fetchMotivationSuggestion(tasks)
//           .then((suggestion) => {
//             setAiSuggestion(suggestion || "Could not get suggestion.");
//           })

//           .finally(() => {
//             setIsLoadingSuggestion(false);
//           });
//       }, 500);

//       return () => clearTimeout(timer);
//     } else {
//       setAiSuggestion("AI suggestions disabled. API Key missing.");

//       setIsLoadingSuggestion(false);
//     }
//   }, [tasks]);

//   useEffect(() => {
//     /* Reminder Simulation */ let reminderTimeoutId = null;

//     const checkReminders = () => {
//       const now = new Date();

//       const currentTimeStr = `${String(now.getHours()).padStart(
//         2,

//         "0"
//       )}:${String(now.getMinutes()).padStart(2, "0")}`;

//       let reminderTask = null;

//       if (Array.isArray(tasks)) {
//         tasks.forEach((task) => {
//           if (
//             task.time === currentTimeStr &&
//             !task.completed &&
//             !task.reminderShown
//           ) {
//             reminderTask = task;
//           }
//         });
//       }

//       if (reminderTask) {
//         alert(`Reminder: ${reminderTask.title}`);

//         setTasks((currentTasks) =>
//           currentTasks.map((t) =>
//             t.id === reminderTask.id ? { ...t, reminderShown: true } : t
//           )
//         );

//         if (reminderTimeoutId) clearTimeout(reminderTimeoutId);

//         reminderTimeoutId = setTimeout(() => {
//           setTasks((currentTasks) =>
//             currentTasks.map((t) => {
//               if (t.id === reminderTask.id) {
//                 return { ...t, reminderShown: false };
//               }

//               return t;
//             })
//           );

//           reminderTimeoutId = null;
//         }, 60000);
//       }
//     };

//     checkReminders();

//     const intervalId = setInterval(checkReminders, 60000);

//     return () => {
//       clearInterval(intervalId);

//       if (reminderTimeoutId) {
//         clearTimeout(reminderTimeoutId);
//       }
//     };
//   }, [tasks]);

//   useEffect(() => {
//     /* Scroll chat */ setTimeout(() => {
//       chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 0);
//   }, [chatHistory]);

//   useEffect(() => {
//     /* Update current time & active tasks */ const updateTime = () => {
//       const now = new Date();

//       const currentMinutesValue = timeToMinutes(
//         `${now.getHours()}:${now.getMinutes()}`
//       );

//       setCurrentTimeMinutes(currentMinutesValue);

//       const activeIds = tasks

//         .filter((task) => {
//           if (task.completed || !task.time) return false;

//           const startMinutes = timeToMinutes(task.time);

//           const endMinutes = task.endTime
//             ? timeToMinutes(task.endTime)
//             : startMinutes;

//           if (startMinutes === null || endMinutes === null) return false;

//           if (endMinutes < startMinutes) {
//             return (
//               currentMinutesValue >= startMinutes ||
//               currentMinutesValue <= endMinutes
//             );
//           } else {
//             return (
//               currentMinutesValue >= startMinutes &&
//               currentMinutesValue <= endMinutes
//             );
//           }
//         })

//         .map((task) => task.id);

//       setActiveTaskIds(activeIds);
//     };

//     updateTime();

//     const intervalId = setInterval(updateTime, 60000);

//     return () => clearInterval(intervalId);
//   }, [tasks]);

//   // --- Task Management Callbacks ---

//   const closeModal = useCallback(() => {
//     setIsModalOpen(false);

//     setEditingTask(null);

//     setNewTaskTitle("");

//     setNewTaskTime("");

//     setNewTaskEndTime("");
//   }, []);

//   const upsertTask = useCallback(
//     (taskDataOrArray) => {
//       const tasksToProcess = Array.isArray(taskDataOrArray)
//         ? taskDataOrArray
//         : [taskDataOrArray];

//       if (tasksToProcess.length === 0) return;

//       const processedTasks = tasksToProcess

//         .map((taskData) => ({
//           id: taskData.id || Date.now() + Math.random(),

//           title: (taskData.title || "").trim(),

//           time: taskData.time || null,

//           endTime: taskData.endTime || null,

//           completed: taskData.completed || false,

//           reminderShown: false,
//         }))

//         .filter((task) => task.title);

//       if (processedTasks.length === 0) return;

//       setTasks((prevTasks) => {
//         const currentTasks = Array.isArray(prevTasks) ? prevTasks : [];

//         let updatedTasks = [...currentTasks];

//         processedTasks.forEach((newTask) => {
//           const existingIndex = updatedTasks.findIndex(
//             (t) => t.id === newTask.id
//           );

//           if (existingIndex > -1) {
//             updatedTasks[existingIndex] = {
//               ...updatedTasks[existingIndex],

//               ...newTask,
//             };
//           } else {
//             updatedTasks.push(newTask);
//           }
//         });

//         updatedTasks.sort((a, b) => {
//           const timeA = a.time ? timeToMinutes(a.time) : 99999;

//           const timeB = b.time ? timeToMinutes(b.time) : 99999;

//           if (timeA !== timeB) {
//             return timeA - timeB;
//           }

//           return a.id - b.id;
//         });

//         return updatedTasks;
//       });
//     },

//     [setTasks]
//   );

//   const handleModalAddTask = useCallback(() => {
//     upsertTask({
//       id: editingTask ? editingTask.id : undefined,

//       title: newTaskTitle,

//       time: newTaskTime,

//       endTime: newTaskEndTime,

//       completed: editingTask ? editingTask.completed : false,
//     });

//     closeModal();
//   }, [
//     upsertTask,

//     editingTask,

//     newTaskTitle,

//     newTaskTime,

//     newTaskEndTime,

//     closeModal,
//   ]);

//   const findTaskIdByTitle = useCallback(
//     (titleToFind) => {
//       if (!titleToFind || !Array.isArray(tasks)) return null;

//       const searchTerm = titleToFind.trim().toLowerCase();

//       if (!searchTerm) return null;

//       let foundTask = tasks.find(
//         (task) => task.title.trim().toLowerCase() === searchTerm
//       );

//       if (foundTask) return foundTask.id;

//       const includesMatches = tasks.filter((task) =>
//         task.title.trim().toLowerCase().includes(searchTerm)
//       );

//       if (includesMatches.length === 1) return includesMatches[0].id;

//       if (includesMatches.length > 1) {
//         console.warn(
//           `Multiple tasks match "${titleToFind}". Selecting first match: "${includesMatches[0].title}"`
//         );

//         return includesMatches[0].id;
//       }

//       return null;
//     },

//     [tasks]
//   ); // Added warning for multiple matches

//   const handleToggleComplete = useCallback(
//     (id) => {
//       if (!id) return;

//       setTasks((currentTasks) => {
//         if (!Array.isArray(currentTasks)) return [];

//         return currentTasks.map((task) =>
//           task.id === id ? { ...task, completed: !task.completed } : task
//         );
//       });
//     },

//     [setTasks]
//   );

//   const handleDeleteTask = useCallback(
//     (id) => {
//       if (!id) return;

//       setTasks((prevTasks) =>
//         Array.isArray(prevTasks)
//           ? prevTasks.filter((task) => task.id !== id)
//           : []
//       );
//     },

//     [setTasks]
//   );

//   const openModalForEdit = useCallback((task) => {
//     setEditingTask(task);

//     setNewTaskTitle(task.title);

//     setNewTaskTime(task.time || "");

//     setNewTaskEndTime(task.endTime || "");

//     setIsModalOpen(true);
//   }, []);

//   const openModalForNew = useCallback(() => {
//     setEditingTask(null);

//     setNewTaskTitle("");

//     setNewTaskTime("");

//     setNewTaskEndTime("");

//     setIsModalOpen(true);
//   }, []);

//   const generateRecurringTasks = useCallback(
//     (title, interval, startTimeStr, endTimeStr) => {
//       const generated = [];

//       const formatTime = (hour) => String(hour).padStart(2, "0") + ":00";

//       let startHour;

//       let endHour = 20;

//       if (startTimeStr === null || startTimeStr === "now") {
//         startHour = new Date().getHours();
//       } else if (startTimeStr && startTimeStr.includes(":")) {
//         startHour = parseInt(startTimeStr.split(":")[0], 10);
//       } else {
//         startHour = 8;
//       }

//       if (endTimeStr && endTimeStr.includes(":")) {
//         endHour = parseInt(endTimeStr.split(":")[0], 10);
//       } else {
//         endHour = 20;
//       }

//       if (
//         isNaN(startHour) ||
//         isNaN(endHour) ||
//         startHour < 0 ||
//         startHour > 23 ||
//         endHour < 0 ||
//         endHour > 23
//       ) {
//         console.error("Invalid recurrence times:", startTimeStr, endTimeStr);

//         return [];
//       }

//       if (interval === "hourly") {
//         if (endHour < startHour) {
//           for (let hour = startHour; hour <= 23; hour++) {
//             const timeStr = formatTime(hour);

//             generated.push({ title: title, time: timeStr, completed: false });
//           }

//           for (let hour = 0; hour <= endHour; hour++) {
//             const timeStr = formatTime(hour);

//             generated.push({ title: title, time: timeStr, completed: false });
//           }
//         } else {
//           for (let hour = startHour; hour <= endHour; hour++) {
//             const timeStr = formatTime(hour);

//             generated.push({ title: title, time: timeStr, completed: false });
//           }
//         }
//       } else if (interval === "daily") {
//         generated.push({
//           title: title,

//           time: formatTime(startHour),

//           completed: false,
//         });
//       } else {
//         console.warn("Unsupported interval:", interval);
//       }

//       console.log("Generated Tasks:", generated);

//       return generated;
//     },

//     []
//   );

//   // --- Chat Handling (Handles Suggest Tasks Confirmation, Delete Confirmation) ---

//   const handleSendChatMessage = useCallback(async () => {
//     const messageText = chatInput.trim();

//     if (!messageText || isChatLoading) return;

//     const newUserMessage = { sender: "user", text: messageText };

//     setChatHistory((prev) => [...prev, newUserMessage]);

//     setChatInput("");

//     let requiresConfirmation = false;

//     let chatMessageToAdd = "";

//     try {
//       // --- Confirmation Flow ---

//       if (awaitingConfirmation && pendingActionData) {
//         let confirmationResponse = "";

//         const answer = messageText.toLowerCase();

//         let resetConfirmationState = true;

//         try {
//           if (answer === "yes") {
//             switch (pendingActionData.action) {
//               case ACTION_ADD_RECURRING_TASK:

//               case ACTION_SUGGEST_TASKS:
//                 upsertTask(pendingActionData.tasks);

//                 confirmationResponse = `Okay, added ${pendingActionData.tasks.length} task(s).`;

//                 break;

//               case ACTION_COMPLETE_ALL_TASKS:

//               case ACTION_COMPLETE_TASKS_UNTIL:

//               case ACTION_COMPLETE_TASKS_MATCHING:
//                 if (
//                   pendingActionData.taskIds &&
//                   pendingActionData.taskIds.length > 0
//                 ) {
//                   pendingActionData.taskIds.forEach((id) =>
//                     handleToggleComplete(id)
//                   );

//                   confirmationResponse = `Okay, marked ${pendingActionData.taskIds.length} task(s) as complete.`;
//                 } else {
//                   confirmationResponse = "No tasks found to modify.";
//                 }

//                 break;

//               case ACTION_DELETE_TASK:

//               case ACTION_DELETE_ALL_TASKS: // Combined delete confirmation
//                 if (
//                   pendingActionData.taskIds &&
//                   pendingActionData.taskIds.length > 0
//                 ) {
//                   pendingActionData.taskIds.forEach((id) =>
//                     handleDeleteTask(id)
//                   );

//                   confirmationResponse = `Okay, deleted ${pendingActionData.taskIds.length} task(s).`;
//                 } else {
//                   confirmationResponse = "No tasks found to delete.";
//                 }

//                 break;

//               default:
//                 confirmationResponse = "Action confirmed (unknown).";
//             }
//           } else if (answer === "no") {
//             confirmationResponse = "Okay, action cancelled.";
//           } else {
//             confirmationResponse = `Please confirm: 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;

//             resetConfirmationState = false;
//           }
//         } catch (error) {
//           console.error("Error during confirmation:", error);

//           confirmationResponse = "Error performing action.";

//           resetConfirmationState = true;
//         } finally {
//           if (resetConfirmationState) {
//             setPendingActionData(null);

//             setAwaitingConfirmation(false);
//           }
//         }

//         setChatHistory((prev) => [
//           ...prev,

//           { sender: "bot", text: confirmationResponse },
//         ]);

//         chatInputRef.current?.focus();

//         return;
//       }

//       // --- Regular Chat / Action Handling ---

//       setIsChatLoading(true);

//       const currentChatHistory = [...chatHistory, newUserMessage];

//       const botResponse = await fetchChatResponse(
//         tasks,

//         currentChatHistory,

//         messageText,

//         userName
//       );

//       if (botResponse.action) {
//         let taskIdsToModify = [];

//         let confirmationPrompt = "";

//         switch (botResponse.action) {
//           case ACTION_ADD_TASK:
//             upsertTask({
//               title: botResponse.title,

//               time: botResponse.time,

//               endTime: botResponse.endTime,
//             });

//             chatMessageToAdd = `Okay, I've added "${botResponse.title}" to your list.`;

//             break; // Improved confirmation

//           case ACTION_COMPLETE_TASK:

//           case ACTION_COMPLETE_AND_DELETE_TASK:
//             const completeTaskId = findTaskIdByTitle(botResponse.title);

//             if (!completeTaskId) {
//               chatMessageToAdd = `Sorry, I couldn't find the task "${botResponse.title}". Please be more specific.`;
//             } else {
//               const taskTitle =
//                 tasks.find((t) => t.id === completeTaskId)?.title ||
//                 botResponse.title;

//               handleToggleComplete(completeTaskId);

//               chatMessageToAdd = `Okay, marked "${taskTitle}" complete.`;

//               if (botResponse.action === ACTION_COMPLETE_AND_DELETE_TASK) {
//                 setTimeout(() => handleDeleteTask(completeTaskId), 50);

//                 chatMessageToAdd += " And deleted it.";
//               }
//             }

//             break;

//           case ACTION_DELETE_TASK:
//             const deleteTaskId = findTaskIdByTitle(botResponse.title);

//             if (!deleteTaskId) {
//               chatMessageToAdd = `Sorry, I couldn't find the task "${botResponse.title}". Please be more specific.`;
//             } else {
//               const taskTitle =
//                 tasks.find((t) => t.id === deleteTaskId)?.title ||
//                 botResponse.title;

//               requiresConfirmation = true;

//               confirmationPrompt = `Delete "${taskTitle}"? (yes/no)`;

//               setPendingActionData({
//                 action: ACTION_DELETE_TASK,

//                 taskIds: [deleteTaskId],

//                 confirmationPrompt: confirmationPrompt,
//               });
//             }

//             break;

//           case ACTION_ADD_RECURRING_TASK:
//             const generatedTasks = generateRecurringTasks(
//               botResponse.title,

//               botResponse.interval,

//               botResponse.startTime,

//               botResponse.endTime
//             );

//             if (generatedTasks.length > 0) {
//               requiresConfirmation = true;

//               confirmationPrompt = `AI proposes adding ${
//                 generatedTasks.length
//               } "${botResponse.title}" tasks (${
//                 botResponse.interval || "interval"
//               }). Add them? (yes/no)`;

//               setPendingActionData({
//                 action: botResponse.action,

//                 tasks: generatedTasks,

//                 confirmationPrompt: confirmationPrompt,
//               });
//             } else {
//               chatMessageToAdd = `Sorry, couldn't generate recurring tasks for "${botResponse.title}".`;
//             }

//             break;

//           // *** Correctly handle suggest_tasks confirmation ***

//           case ACTION_SUGGEST_TASKS:
//             if (botResponse.tasks && botResponse.tasks.length > 0) {
//               requiresConfirmation = true;

//               confirmationPrompt = `AI suggests adding these tasks: ${botResponse.tasks

//                 .map((t) => t.title)

//                 .join(", ")}. Add them? (yes/no)`;

//               setPendingActionData({
//                 action: botResponse.action,

//                 tasks: botResponse.tasks,

//                 confirmationPrompt: confirmationPrompt,
//               });
//             } else {
//               chatMessageToAdd = "AI couldn't suggest tasks now.";
//             }

//             break;

//           case ACTION_COMPLETE_ALL_TASKS:
//             taskIdsToModify = tasks

//               .filter((t) => !t.completed)

//               .map((t) => t.id);

//             if (taskIdsToModify.length > 0) {
//               requiresConfirmation = true;

//               confirmationPrompt = `Mark all ${taskIdsToModify.length} pending task(s) complete? (yes/no)`;

//               setPendingActionData({
//                 action: botResponse.action,

//                 taskIds: taskIdsToModify,

//                 confirmationPrompt: confirmationPrompt,
//               });
//             } else {
//               chatMessageToAdd = "No pending tasks.";
//             }

//             break;

//           case ACTION_COMPLETE_TASKS_UNTIL:
//             const targetTime = botResponse.time;

//             if (targetTime && targetTime.includes(":")) {
//               const targetMinutes = timeToMinutes(targetTime);

//               taskIdsToModify = tasks

//                 .filter((t) => {
//                   if (t.completed || !t.time) return false;

//                   const taskMinutes = timeToMinutes(t.time);

//                   return taskMinutes !== null && taskMinutes <= targetMinutes;
//                 })

//                 .map((t) => t.id);

//               if (taskIdsToModify.length > 0) {
//                 requiresConfirmation = true;

//                 confirmationPrompt = `Mark ${taskIdsToModify.length} task(s) up to ${targetTime} complete? (yes/no)`;

//                 setPendingActionData({
//                   action: botResponse.action,

//                   taskIds: taskIdsToModify,

//                   confirmationPrompt: confirmationPrompt,
//                 });
//               } else {
//                 chatMessageToAdd = `No pending tasks found up to ${targetTime}.`;
//               }
//             } else {
//               chatMessageToAdd = `Invalid time: "${targetTime}". Use HH:MM.`;
//             }

//             break;

//           case ACTION_COMPLETE_TASKS_MATCHING:
//             const pattern = botResponse.title_pattern;

//             if (pattern) {
//               taskIdsToModify = tasks

//                 .filter(
//                   (t) =>
//                     !t.completed &&
//                     t.title.toLowerCase().includes(pattern.toLowerCase())
//                 )

//                 .map((t) => t.id);

//               if (taskIdsToModify.length > 0) {
//                 requiresConfirmation = true;

//                 confirmationPrompt = `Mark ${taskIdsToModify.length} task(s) matching "${pattern}" complete? (yes/no)`;

//                 setPendingActionData({
//                   action: botResponse.action,

//                   taskIds: taskIdsToModify,

//                   confirmationPrompt: confirmationPrompt,
//                 });
//               } else {
//                 chatMessageToAdd = `No pending tasks found matching "${pattern}".`;
//               }
//             } else {
//               chatMessageToAdd =
//                 "Sorry, I need a name pattern to complete matching tasks.";
//             }

//             break;

//           case ACTION_DELETE_ALL_TASKS:
//             taskIdsToModify = tasks.map((t) => t.id);

//             if (taskIdsToModify.length > 0) {
//               requiresConfirmation = true;

//               confirmationPrompt = `Delete all ${taskIdsToModify.length} task(s)? This cannot be undone. (yes/no)`;

//               setPendingActionData({
//                 action: botResponse.action,

//                 taskIds: taskIdsToModify,

//                 confirmationPrompt: confirmationPrompt,
//               });
//             } else {
//               chatMessageToAdd = "There are no tasks to delete.";
//             }

//             break;

//           default:
//             chatMessageToAdd = botResponse.text || "Unknown action.";
//         }

//         if (requiresConfirmation) chatMessageToAdd = confirmationPrompt;
//       } else {
//         if (
//           messageText.toLowerCase().startsWith("im ") ||
//           messageText.toLowerCase().startsWith("i'm ") ||
//           messageText.toLowerCase().startsWith("my name is ")
//         ) {
//           const potentialName = messageText

//             .split(" ")

//             .slice(-1)[0]
//             .replace(/[^a-zA-Z]/g, "");

//           if (potentialName) {
//             const name =
//               potentialName.charAt(0).toUpperCase() + potentialName.slice(1);

//             setUserName(name);

//             chatMessageToAdd = `Nice to meet you, ${name}! How can I help?`;
//           } else {
//             chatMessageToAdd = botResponse.text;
//           }
//         } else {
//           chatMessageToAdd = botResponse.text;
//         }
//       }
//     } catch (error) {
//       console.error("Error processing chat:", error);

//       chatMessageToAdd = "Sorry, error processing request.";
//     } finally {
//       setIsChatLoading(false);

//       if (chatMessageToAdd) {
//         setChatHistory((prev) => [
//           ...prev,

//           { sender: "bot", text: chatMessageToAdd },
//         ]);
//       }

//       if (requiresConfirmation) {
//         setAwaitingConfirmation(true);
//       }

//       setTimeout(() => chatInputRef.current?.focus(), 0);
//     }
//   }, [
//     chatInput,

//     chatHistory,

//     tasks,

//     isChatLoading,

//     upsertTask,

//     findTaskIdByTitle,

//     handleToggleComplete,

//     handleDeleteTask,

//     awaitingConfirmation,

//     pendingActionData,

//     generateRecurringTasks,

//     userName,
//   ]);

//   const handleChatInputKeyPress = (event) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault();

//       handleSendChatMessage();
//     }
//   };

//   const toggleChat = useCallback(() => {
//     setIsChatOpen((prev) => !prev);
//   }, []);

//   // --- Voice Input Logic ---

//   const setupSpeechRecognition = useCallback(
//     () => {
//       /* ... */ const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;

//       if (!SpeechRecognition) {
//         console.warn("Speech Recognition not supported.");

//         return;
//       }

//       const recognition = new SpeechRecognition();

//       recognition.continuous = false;

//       recognition.interimResults = false;

//       recognition.lang = "en-US";

//       recognition.onstart = () => {
//         setIsListening(true);

//         console.log("Voice started.");
//       };

//       recognition.onresult = (event) => {
//         const transcript =
//           event.results[event.results.length - 1][0].transcript.trim();

//         console.log("Voice transcript:", transcript);

//         setChatInput(transcript);
//       };

//       recognition.onerror = (event) => {
//         console.error("Speech error:", event.error);

//         let errorMsg = `Speech error: ${event.error}`;

//         if (event.error === "not-allowed") {
//           errorMsg = "Mic permission denied.";
//         } else if (event.error === "no-speech") {
//           errorMsg = "No speech detected.";
//         }

//         setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);

//         setIsListening(false);
//       };

//       recognition.onend = () => {
//         console.log("Voice ended.");

//         setIsListening(false);

//         chatInputRef.current?.focus();
//       };

//       recognitionRef.current = recognition;
//     },

//     [
//       /* setChatHistory */
//     ]
//   ); // Added setChatHistory dependency if used in error handling

//   useEffect(() => {
//     setupSpeechRecognition();

//     return () => {
//       recognitionRef.current?.abort();
//     };
//   }, [setupSpeechRecognition]);

//   const handleMicClick = () => {
//     if (isListening) {
//       recognitionRef.current?.stop();
//     } else {
//       navigator.mediaDevices

//         .getUserMedia({ audio: true })

//         .then(() => {
//           recognitionRef.current?.start();
//         })

//         .catch((err) => {
//           console.error("Mic access denied:", err);

//           setChatHistory((prev) => [
//             ...prev,

//             { sender: "bot", text: "Mic access denied." },
//           ]);
//         });
//     }
//   };

//   // --- Memoized Values ---

//   const sortedTasks = useMemo(() => {
//     if (!Array.isArray(tasks)) return [];

//     return [...tasks].sort((a, b) => {
//       const timeA = a.time ? timeToMinutes(a.time) : 99999;

//       const timeB = b.time ? timeToMinutes(b.time) : 99999;

//       if (timeA !== timeB) {
//         return timeA - timeB;
//       }

//       return a.id - b.id;
//     });
//   }, [tasks]);

//   const completedTasksCount = useMemo(
//     () =>
//       Array.isArray(tasks) ? tasks.filter((task) => task.completed).length : 0,

//     [tasks]
//   );

//   const pendingTasksCount = useMemo(
//     () => (Array.isArray(tasks) ? tasks.length : 0) - completedTasksCount,

//     [tasks, completedTasksCount]
//   );

//   const tasksByTimeSlot = useMemo(() => {
//     const slots = {
//       "Morning (Before 12 PM)": [],

//       "Afternoon (12 PM - 5 PM)": [],

//       "Evening (After 5 PM)": [],

//       "Anytime / Unscheduled": [],
//     };

//     if (Array.isArray(sortedTasks)) {
//       sortedTasks.forEach((task) => {
//         if (task.time) {
//           const hour = parseInt(task.time.split(":")[0]);

//           if (hour < 12) slots["Morning (Before 12 PM)"].push(task);
//           else if (hour < 17) slots["Afternoon (12 PM - 5 PM)"].push(task);
//           else slots["Evening (After 5 PM)"].push(task);
//         } else {
//           slots["Anytime / Unscheduled"].push(task);
//         }
//       });
//     }

//     return slots;
//   }, [sortedTasks]);

//   const AiIconComponent = isLoadingSuggestion ? Zap : Brain;

//   // --- Render JSX ---

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans text-gray-800 overflow-hidden">
//       {/* Header */}

//       <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 flex-shrink-0">
//         <div className="container mx-auto px-4 py-3 flex justify-between items-center">
//           {" "}
//           <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
//             {" "}
//             My Day Planner Pro{" "}
//           </h1>{" "}
//           <div className="flex items-center space-x-2 md:space-x-4">
//             {" "}
//             <div className="text-right hidden sm:block">
//               {" "}
//               <p className="text-sm font-medium text-gray-700">
//                 {getGreeting()}, {userName}!
//               </p>{" "}
//               <p className="text-xs text-gray-500">
//                 {" "}
//                 {currentDate.toLocaleDateString(undefined, {
//                   weekday: "long",

//                   month: "long",

//                   day: "numeric",
//                 })}{" "}
//               </p>{" "}
//             </div>{" "}
//           </div>{" "}
//         </div>
//       </header>

//       {/* Main Content Area */}

//       <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden relative">
//         {/* Left Column */}

//         <div className="lg:col-span-2 space-y-4 md:space-y-6 overflow-y-auto pr-1 md:pr-2">
//           {/* Snapshot Card */}

//           <Card className="bg-white/70">
//             <CardHeader>
//               {" "}
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Zap size={20} className="text-yellow-500" /> Today's Snapshot
//               </CardTitle>{" "}
//             </CardHeader>{" "}
//             <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               {" "}
//               <div className="space-y-1">
//                 {" "}
//                 <p className="text-sm text-gray-600">
//                   Pending:{" "}
//                   <span className="font-semibold text-orange-600">
//                     {pendingTasksCount}
//                   </span>
//                 </p>{" "}
//                 <p className="text-sm text-gray-600">
//                   Completed:{" "}
//                   <span className="font-semibold text-green-600">
//                     {completedTasksCount}
//                   </span>
//                 </p>{" "}
//               </div>{" "}
//               <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg flex items-center gap-2 shadow-sm border border-blue-200 flex-1 min-w-0">
//                 {" "}
//                 <AiIconComponent
//                   size={20}
//                   className={`flex-shrink-0 text-blue-600 ${
//                     isLoadingSuggestion ? "animate-pulse" : ""
//                   }`}
//                 />{" "}
//                 <span className="italic whitespace-pre-line text-xs sm:text-sm">
//                   {" "}
//                   {isLoadingSuggestion
//                     ? "Getting suggestion..."
//                     : aiSuggestion}{" "}
//                 </span>{" "}
//               </div>{" "}
//             </CardContent>{" "}
//             <CardFooter>
//               {" "}
//               <Button
//                 onClick={openModalForNew}
//                 className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow duration-300"
//               >
//                 {" "}
//                 <Plus size={18} className="mr-2" /> Add New Task{" "}
//               </Button>{" "}
//             </CardFooter>
//           </Card>

//           {/* Task List Card */}

//           <Card className="bg-white/70">
//             <CardHeader>
//               {" "}
//               <CardTitle className="text-lg">Your Tasks</CardTitle>{" "}
//               <CardDescription>Manage your daily tasks.</CardDescription>{" "}
//             </CardHeader>

//             <CardContent>
//               {tasks && tasks.length > 0 ? (
//                 <ul className="space-y-3">
//                   {" "}
//                   {sortedTasks.map((task) => {
//                     const isActive = activeTaskIds.includes(task.id);

//                     const isCompleted = task.completed;

//                     return (
//                       <li
//                         key={task.id}
//                         className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ease-in-out group ${
//                           isCompleted
//                             ? "bg-green-50 border-green-200 opacity-60"
//                             : ""
//                         } ${
//                           isActive && !isCompleted
//                             ? "bg-yellow-50 border-yellow-300 shadow-sm"
//                             : ""
//                         } ${
//                           !isActive && !isCompleted
//                             ? "bg-white border-gray-200 hover:bg-gray-50"
//                             : ""
//                         } `}
//                       >
//                         {" "}
//                         <div className="flex items-center space-x-3 flex-1 min-w-0">
//                           {" "}
//                           <Checkbox
//                             checked={isCompleted}
//                             onChange={() => handleToggleComplete(task.id)}
//                             id={`task-check-${task.id}`}
//                             className="cursor-pointer flex-shrink-0"
//                           />{" "}
//                           <label
//                             htmlFor={`task-check-${task.id}`}
//                             className={`flex-1 min-w-0 cursor-pointer ${
//                               isCompleted
//                                 ? "line-through text-gray-500"
//                                 : "text-gray-800"
//                             }`}
//                           >
//                             {" "}
//                             <span
//                               className={`font-medium block truncate text-sm md:text-base ${
//                                 isActive && !isCompleted
//                                   ? "text-yellow-800"
//                                   : ""
//                               }`}
//                             >
//                               {task.title}
//                             </span>{" "}
//                             {(task.time || task.endTime) && (
//                               <span className="text-xs text-blue-600 flex items-center gap-1">
//                                 {" "}
//                                 <Clock size={12} /> {task.time}
//                                 {task.endTime ? ` - ${task.endTime}` : ""}{" "}
//                               </span>
//                             )}{" "}
//                           </label>{" "}
//                         </div>{" "}
//                         <div className="flex items-center space-x-1 md:space-x-2 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
//                           {" "}
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="text-gray-500 hover:text-blue-600 h-8 w-8"
//                             onClick={(e) => {
//                               e.stopPropagation();

//                               openModalForEdit(task);
//                             }}
//                           >
//                             {" "}
//                             <Edit size={16} />{" "}
//                             <span className="sr-only">Edit</span>{" "}
//                           </Button>{" "}
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="text-gray-500 hover:text-red-600 h-8 w-8"
//                             onClick={(e) => {
//                               e.stopPropagation();

//                               handleDeleteTask(task.id);
//                             }}
//                           >
//                             {" "}
//                             <Trash2 size={16} />{" "}
//                             <span className="sr-only">Delete</span>{" "}
//                           </Button>{" "}
//                         </div>{" "}
//                       </li>
//                     );
//                   })}{" "}
//                 </ul>
//               ) : (
//                 <p className="text-center text-gray-500 py-4">
//                   No tasks added yet.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column */}

//         <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col overflow-y-auto pr-1 md:pr-2">
//           {/* Daily Schedule Card */}
//           <Card className="bg-white/70 flex-shrink-0">
//             <CardHeader>
//               {" "}
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <CalendarIcon size={20} className="text-purple-600" /> Daily
//                 Schedule
//               </CardTitle>{" "}
//               <CardDescription>Your day at a glance.</CardDescription>{" "}
//             </CardHeader>

//             <CardContent className="space-y-4 max-h-96 overflow-y-auto">
//               {tasks && tasks.length > 0 ? (
//                 Object.entries(tasksByTimeSlot).map(
//                   ([slot, slotTasks]) =>
//                     slotTasks.length > 0 && (
//                       <div key={slot}>
//                         {" "}
//                         <h4 className="font-semibold text-sm mb-2 text-gray-600 flex items-center gap-1.5">
//                           {" "}
//                           {slot.includes("Morning") && (
//                             <Sun size={16} className="text-yellow-500" />
//                           )}{" "}
//                           {slot.includes("Afternoon") && (
//                             <Coffee size={16} className="text-amber-700" />
//                           )}{" "}
//                           {slot.includes("Evening") && (
//                             <Moon size={16} className="text-blue-800" />
//                           )}{" "}
//                           {!slot.includes("Morning") &&
//                             !slot.includes("Afternoon") &&
//                             !slot.includes("Evening") && (
//                               <Clock size={16} className="text-gray-500" />
//                             )}{" "}
//                           {slot}{" "}
//                         </h4>{" "}
//                         <ul className="space-y-2 pl-4 border-l-2 border-blue-200">
//                           {" "}
//                           {slotTasks.map((task) => {
//                             const isActive = activeTaskIds.includes(task.id);

//                             const isCompleted = task.completed;

//                             return (
//                               <li
//                                 key={task.id}
//                                 className={`text-sm flex items-start gap-2 ${
//                                   isCompleted
//                                     ? "text-gray-400 line-through italic"
//                                     : "text-gray-700"
//                                 } ${
//                                   isActive && !isCompleted
//                                     ? "font-medium text-yellow-700"
//                                     : ""
//                                 }`}
//                               >
//                                 {" "}
//                                 <span
//                                   className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
//                                     isCompleted
//                                       ? "bg-green-400"
//                                       : isActive
//                                       ? "bg-yellow-500"
//                                       : "bg-gray-400"
//                                   }`}
//                                 ></span>{" "}
//                                 <div>
//                                   {" "}
//                                   <span className="truncate">
//                                     {task.title}
//                                   </span>{" "}
//                                   {task.time && (
//                                     <span className="ml-1 text-xs text-blue-500">
//                                       ({task.time}
//                                       {task.endTime ? `-${task.endTime}` : ""})
//                                     </span>
//                                   )}{" "}
//                                 </div>{" "}
//                               </li>
//                             );
//                           })}{" "}
//                         </ul>{" "}
//                       </div>
//                     )
//                 )
//               ) : (
//                 <p className="text-center text-gray-500 py-4">
//                   Your schedule is empty.
//                 </p>
//               )}{" "}
//             </CardContent>
//           </Card>
//           <div className="flex-grow"></div> {/* Pushes schedule card up */}
//         </div>

//         {/* --- Floating Action Button for Chat --- */}

//         {!isChatOpen && (
//           <Button
//             onClick={toggleChat}
//             variant="default"
//             size="icon"
//             className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
//           >
//             {" "}
//             <MessageSquare size={24} />{" "}
//             <span className="sr-only">Open Chat</span>{" "}
//           </Button>
//         )}
//       </main>

//       {/* Chat Window */}

//       {isChatOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//             onClick={toggleChat}
//           ></div>

//           <div
//             className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
//               isChatOpen ? "translate-x-0" : "translate-x-full"
//             }`}
//           >
//             <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
//               <CardHeader className="flex-shrink-0 border-b flex items-center justify-between">
//                 {" "}
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   <MessageSquare size={20} className="text-indigo-600" /> Chat
//                   Assistant
//                 </CardTitle>{" "}
//                 <Button onClick={toggleChat} variant="ghost" size="icon">
//                   {" "}
//                   <X size={20} /> <span className="sr-only">Close Chat</span>{" "}
//                 </Button>{" "}
//               </CardHeader>

//               <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative">
//                 {chatHistory.length === 0 && !isChatLoading && (
//                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                     {" "}
//                     <p className="text-gray-400 italic text-center px-4">
//                       How can I help you plan your day, {userName}?
//                     </p>{" "}
//                   </div>
//                 )}

//                 {chatHistory.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`flex items-start gap-2.5 ${
//                       msg.sender === "user" ? "justify-end" : ""
//                     }`}
//                   >
//                     {" "}
//                     {msg.sender === "bot" && (
//                       <Bot
//                         size={18}
//                         className="text-indigo-500 flex-shrink-0 mt-1"
//                       />
//                     )}{" "}
//                     <div
//                       className={`p-2.5 rounded-lg max-w-[85%] ${
//                         msg.sender === "user"
//                           ? "bg-blue-100 text-blue-900"
//                           : "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {" "}
//                       <ReactMarkdown className="text-sm prose prose-sm max-w-none">
//                         {msg.text}
//                       </ReactMarkdown>{" "}
//                     </div>{" "}
//                     {msg.sender === "user" && (
//                       <User
//                         size={18}
//                         className="text-blue-500 flex-shrink-0 mt-1"
//                       />
//                     )}{" "}
//                   </div>
//                 ))}

//                 {isChatLoading && (
//                   <div className="flex items-start gap-2.5">
//                     {" "}
//                     <Bot
//                       size={18}
//                       className="text-indigo-500 flex-shrink-0 mt-1 animate-pulse"
//                     />{" "}
//                     <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500 italic">
//                       {" "}
//                       Assistant is thinking...{" "}
//                     </div>{" "}
//                   </div>
//                 )}

//                 <div ref={chatMessagesEndRef} />
//               </CardContent>

//               <CardFooter className="border-t pt-4 pb-4 px-4 bg-white flex-shrink-0">
//                 <div className="flex w-full items-center space-x-2">
//                   <Input
//                     ref={chatInputRef}
//                     type="text"
//                     placeholder={
//                       isListening ? "Listening..." : "Type or use mic..."
//                     }
//                     className="flex-1"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     onKeyPress={handleChatInputKeyPress}
//                     disabled={isChatLoading}
//                   />

//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={handleMicClick}
//                     disabled={isChatLoading}
//                     className={`text-gray-500 hover:text-indigo-600 ${
//                       isListening ? "text-red-500 hover:text-red-600" : ""
//                     }`}
//                     title={isListening ? "Stop Listening" : "Start Listening"}
//                   >
//                     {" "}
//                     {isListening ? (
//                       <MicOff size={18} />
//                     ) : (
//                       <Mic size={18} />
//                     )}{" "}
//                   </Button>

//                   <Button
//                     size="icon"
//                     onClick={handleSendChatMessage}
//                     disabled={!chatInput.trim() || isChatLoading}
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white"
//                   >
//                     {" "}
//                     <Send size={18} />{" "}
//                   </Button>
//                 </div>
//               </CardFooter>
//             </Card>
//           </div>
//         </>
//       )}

//       {/* Add/Edit Task Modal */}

//       <Dialog open={isModalOpen} onClose={closeModal}>
//         <DialogContent>
//           <DialogHeader>
//             {" "}
//             <DialogTitle>
//               {editingTask ? "Edit Task" : "Add New Task"}
//             </DialogTitle>{" "}
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               {" "}
//               <label
//                 htmlFor="task-title"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Task Title
//               </label>{" "}
//               <Input
//                 id="task-title"
//                 value={newTaskTitle}
//                 onChange={(e) => setNewTaskTitle(e.target.value)}
//                 placeholder="E.g., Meeting with team"
//                 className="w-full"
//                 autoFocus
//               />{" "}
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 {" "}
//                 <label
//                   htmlFor="task-time"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Start Time (Optional)
//                 </label>{" "}
//                 <Input
//                   id="task-time"
//                   type="time"
//                   value={newTaskTime}
//                   onChange={(e) => setNewTaskTime(e.target.value)}
//                   className="w-full"
//                 />{" "}
//               </div>

//               <div>
//                 {" "}
//                 <label
//                   htmlFor="task-endTime"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   End Time (Optional)
//                 </label>{" "}
//                 <Input
//                   id="task-endTime"
//                   type="time"
//                   value={newTaskEndTime}
//                   onChange={(e) => setNewTaskEndTime(e.target.value)}
//                   className="w-full"
//                 />{" "}
//               </div>
//             </div>
//           </div>

//           <DialogFooter>
//             {" "}
//             <Button variant="outline" onClick={closeModal}>
//               Cancel
//             </Button>{" "}
//             <Button
//               onClick={handleModalAddTask}
//               className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
//             >
//               {" "}
//               {editingTask ? "Save Changes" : "Add Task"}{" "}
//             </Button>{" "}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default App;

//Version -2

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import ReactMarkdown from "react-markdown";

// // --- Calendar Component ---
// // NOTE: To enable the calendar view:
// // 1. Run: npm install react-calendar
// // 2. Uncomment the next two lines:
// import Calendar from "react-calendar"; // UNCOMMENT THIS LINE
// import "react-calendar/dist/Calendar.css"; // UNCOMMENT THIS LINE
// // --- End Calendar Instructions ---

// import {
//   Calendar as CalendarIcon,
//   Plus,
//   Trash2,
//   Edit,
//   CheckCircle, // Icon for completed / avoided
//   XCircle, // Icon for incomplete / indulged
//   Brain, // Icon for AI
//   MessageSquare,
//   Send,
//   User,
//   Bot,
//   X, // Icon for close
//   Mic,
//   MicOff,
//   Repeat, // Icon for Habits
//   Zap, // Icon for loading/activity
//   Settings, // Icon for manage habits
//   Info, // Icon for info/placeholder
//   AlertTriangle,
//   TrendingUp, // Icon for good habits
//   TrendingDown, // Icon for bad habits
//   ThumbsUp, // Alternative for Good
//   ThumbsDown, // Alternative for Bad
// } from "lucide-react"; // Assuming lucide-react is installed

// // --- Hardcoded API Key (Temporary - Remove Before Production!) ---
// const GEMINI_API_KEY = "AIzaSyDRSwIOzdttALUQtOXkPkhgTvG5w-oOxeU"; // Replace with your actual key management later
// console.warn(
//   "Using hardcoded GEMINI_API_KEY for development. Replace with secure environment variable handling before production!"
// );

// const GEMINI_API_ENDPOINT = GEMINI_API_KEY
//   ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`
//   : "";

// // --- Action Constants (Habit Focused) ---
// const ACTION_ADD_HABIT = "add_habit";
// const ACTION_DELETE_HABIT = "delete_habit";
// const ACTION_COMPLETE_HABIT_DATE = "complete_habit_date";
// const ACTION_SUGGEST_HABITS = "suggest_habits";
// const ACTION_GENERAL_CHAT = "general_chat";
// const ACTION_DELETE_ALL_HABITS = "delete_all_habits";
// const ACTION_COMPLETE_ALL_HABITS_TODAY = "complete_all_habits_today";

// // --- Date/Time Helpers ---
// const formatDate = (date) => {
//   if (!(date instanceof Date) || isNaN(date)) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };
// const parseDate = (dateString) => {
//   if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
//   const [year, month, day] = dateString.split("-").map(Number);
//   const date = new Date(Date.UTC(year, month - 1, day));
//   return isNaN(date.getTime()) ? null : date;
// };

// // --- Mock shadcn/ui Components (Simplified) ---
// const Button = ({
//   children,
//   variant = "default",
//   size = "default",
//   className = "",
//   ...props
// }) => {
//   const baseStyle =
//     "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
//   const variants = {
//     default: "bg-blue-600 text-white hover:bg-blue-600/90",
//     destructive: "bg-red-600 text-white hover:bg-red-600/90",
//     outline:
//       "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
//     secondary:
//       "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
//     ghost:
//       "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
//     link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
//   };
//   const sizes = {
//     default: "h-10 px-4 py-2",
//     sm: "h-9 rounded-md px-3",
//     lg: "h-11 rounded-md px-8",
//     icon: "h-10 w-10",
//   };
//   return (
//     <button
//       className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };
// const Input = React.forwardRef(
//   ({ className = "", type = "text", ...props }, ref) => (
//     <input
//       type={type}
//       className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400 ${className}`}
//       ref={ref}
//       {...props}
//     />
//   )
// );
// Input.displayName = "Input";
// const Card = ({ children, className = "", ...props }) => (
//   <div
//     className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const CardHeader = ({ children, className = "", ...props }) => (
//   <div
//     className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const CardTitle = ({ children, className = "", as = "h3", ...props }) => {
//   const Tag = as;
//   return (
//     <Tag
//       className={`text-lg font-semibold leading-none tracking-tight ${className}`}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };
// const CardDescription = ({ children, className = "", ...props }) => (
//   <p
//     className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
//     {...props}
//   >
//     {children}
//   </p>
// );
// const CardContent = ({ children, className = "", ...props }) => (
//   <div className={`p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const CardFooter = ({ children, className = "", ...props }) => (
//   <div className={`flex items-center p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const Dialog = ({ open, onClose, children }) => {
//   if (!open) return null;
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg mx-auto overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };
// const DialogContent = ({ children, className = "", ...props }) => (
//   <div className={`p-6 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const DialogHeader = ({ children, className = "", ...props }) => (
//   <div
//     className={`mb-4 border-b border-gray-200 dark:border-gray-800 pb-4 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const DialogTitle = ({ children, className = "", as = "h2", ...props }) => {
//   const Tag = as;
//   return (
//     <Tag
//       className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };
// const DialogFooter = ({ children, className = "", ...props }) => (
//   <div
//     className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 border-t border-gray-200 dark:border-gray-800 pt-4 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const RadioGroup = ({ children, className = "", ...props }) => (
//   <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const RadioGroupItem = ({
//   value,
//   id,
//   checked,
//   onChange,
//   className = "",
//   ...props
// }) => (
//   <input
//     type="radio"
//     id={id}
//     value={value}
//     checked={checked}
//     onChange={onChange}
//     className={`accent-blue-600 dark:accent-blue-500 ${className}`}
//     {...props}
//   />
// );

// // --- Helper function to get greeting based on time ---
// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return "Good Morning";
//   if (hour < 18) return "Good Afternoon";
//   return "Good Evening";
// };

// // --- API Call: Motivation Suggestion (Habit Focused) ---
// async function fetchMotivationSuggestion(habits, habitLog) {
//   // Check if API key and endpoint are configured
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
//     console.error("Motivation Suggestion Error: API Key or Endpoint missing.");
//     return undefined; // Return undefined to signal no suggestion available
//   }

//   const now = new Date();
//   const todayStr = formatDate(now);
//   const safeHabits = Array.isArray(habits) ? habits : [];
//   const safeLog = habitLog || {};
//   const todaysLog = safeLog[todayStr] || {};

//   // Calculate stats for habits active today
//   const activeHabitsToday = safeHabits.filter((h) => {
//     try {
//       const s = parseDate(h.startDate);
//       const e = h.endDate ? parseDate(h.endDate) : null;
//       const today = parseDate(todayStr);
//       // Ensure all dates are valid before comparison
//       return s && today && today >= s && (!e || today <= e);
//     } catch (e) {
//       return false;
//     } // Ignore habits with invalid dates
//   });

//   const completedToday = activeHabitsToday.filter(
//     (h) => todaysLog[h.id] === true
//   ).length;
//   const missedToday = activeHabitsToday.filter(
//     (h) => todaysLog[h.id] === false
//   ).length;
//   const pendingToday = activeHabitsToday.length - completedToday - missedToday;

//   // Construct the prompt
//   let prompt = `You are a motivational assistant for a Habit Tracker app. The user is viewing their habits. `;
//   prompt += `Today (${todayStr}), out of ${activeHabitsToday.length} active habits, ${completedToday} are done, ${missedToday} are missed, and ${pendingToday} are pending. `;
//   prompt += `Current time: ${now.toLocaleTimeString()}. `;

//   if (pendingToday > 0) {
//     prompt += `Encourage the user to complete their remaining habits for today. `;
//   } else if (completedToday > 0 && activeHabitsToday.length > 0) {
//     prompt += `Congratulate the user on their progress today! `;
//   } else if (activeHabitsToday.length === 0) {
//     prompt += `There are no habits scheduled for today. Maybe plan for tomorrow? `;
//   } else {
//     prompt += `Offer some general encouragement about consistency. `;
//   }

//   prompt += `Provide a short (1-2 sentences) encouraging message based on this context, then a relevant quote on a new line prefixed with 'Quote:'.`;

//   const requestBody = {
//     contents: [{ parts: [{ text: prompt }] }],
//     generationConfig: { maxOutputTokens: 100 },
//   };

//   console.log("Sending motivation prompt:", prompt); // Log the prompt

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;
//       try {
//         const errorJson = await response.json();
//         errorBody = JSON.stringify(errorJson.error || errorJson);
//       } catch (e) {}
//       console.error("Gemini Motivation API Error:", errorBody);
//       throw new Error(`API request failed: ${errorBody}`);
//     }

//     const data = await response.json();
//     console.log("Received motivation data:", data); // Log response data

//     const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!suggestionText) {
//       console.error("Could not parse suggestion text from response:", data);
//       return "Keep building those habits!"; // Fallback suggestion
//     }

//     console.log("Received motivation suggestion:", suggestionText);
//     return suggestionText.trim();
//   } catch (error) {
//     console.error("Error fetching motivation:", error);
//     // Provide specific user-friendly errors if possible
//     if (
//       error.message.includes("API key not valid") ||
//       error.message.includes("400") ||
//       error.message.includes("403")
//     ) {
//       return "AI Suggestion Error: Invalid API Key.";
//     }
//     if (error.message.includes("Quota exceeded")) {
//       return "AI Suggestion Error: API Quota Exceeded.";
//     }
//     if (
//       error.message.includes("Failed to fetch") ||
//       error.message.includes("NetworkError")
//     ) {
//       return "AI Suggestion Error: Network issue.";
//     }
//     return "Could not get suggestion due to an error."; // Generic error
//   }
// }

// // --- API Call: Chat Response (Habit Focused - Updated Actions & Prompt) ---
// async function fetchChatResponse(
//   habits,
//   habitLog,
//   chatHistory,
//   userMessage,
//   userName
// ) {
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT)
//     return { text: "AI features disabled." };

//   const todayStr = formatDate(new Date());
//   const safeHabits = Array.isArray(habits) ? habits : [];
//   const safeHabitLog = habitLog || {};

//   // --- System Instruction / Persona (Habit Focused) ---
//   const systemInstruction = `You are ${userName}'s friendly AI assistant in their Habit Tracker app. Be concise and helpful. Use simple Markdown.

// Your goal is to help manage habits (both 'good' habits to build and 'bad' habits to break). You can also provide general chat/motivation. Respond ONLY with JSON for actions.

// **INSTRUCTIONS:**
// - If asked to list habits (e.g., "what are my habits?"), respond conversationally using the list provided below. Do NOT use JSON for listing.
// - You cannot UPDATE existing habits yet. Inform the user politely.
// - For non-action requests (greetings, questions), respond naturally.
// - For 'bad' habits, marking it 'done' means the user successfully AVOIDED the habit for that day. Marking it 'missed' means they INDULGED in the habit.

// **AVAILABLE HABITS:**
// ${
//   safeHabits.length > 0
//     ? safeHabits
//         .map(
//           (h) =>
//             `- ${h.title} (${
//               h.type === "bad" ? "Break Bad" : "Build Good"
//             }) (Starts: ${h.startDate}, Ends: ${h.endDate || "Ongoing"})`
//         )
//         .join("\n")
//     : "- No habits defined."
// }

// **TODAY'S (${todayStr}) STATUS:**
// ${
//   safeHabits
//     .filter((h) => {
//       const s = parseDate(h.startDate);
//       const e = h.endDate ? parseDate(h.endDate) : null;
//       const today = parseDate(todayStr);
//       return s && today && today >= s && (!e || today <= e);
//     })
//     .map((h) => {
//       const log = safeHabitLog[todayStr]?.[h.id];
//       const statusText =
//         log === true
//           ? h.type === "bad"
//             ? "Avoided"
//             : "Done"
//           : log === false
//           ? h.type === "bad"
//             ? "Indulged"
//             : "Missed"
//           : "Pending";
//       return `- ${h.title}: ${statusText}`;
//     })
//     .join("\n") || "- No habits active today."
// }

// **ACTIONS (Respond ONLY with JSON):**
// - ADD HABIT: Extract title, type ('good' or 'bad'), optional start date (YYYY-MM-DD), optional end date (YYYY-MM-DD). Default start is today, default type is 'good'. JSON: {"action": "${ACTION_ADD_HABIT}", "title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}
// - DELETE HABIT: Extract exact title. JSON: {"action": "${ACTION_DELETE_HABIT}", "title": "..."} (Requires confirmation)
// - DELETE ALL HABITS: User must explicitly ask to delete ALL. JSON: {"action": "${ACTION_DELETE_ALL_HABITS}"} (Requires confirmation)
// - COMPLETE HABIT FOR DATE: Extract habit title and date (YYYY-MM-DD, defaults to today if unspecified). Status is 'true' (done/avoided) or 'false' (missed/indulged). JSON: {"action": "${ACTION_COMPLETE_HABIT_DATE}", "title": "...", "date": "YYYY-MM-DD", "status": true | false}
// - COMPLETE ALL HABITS TODAY: Mark all habits active today as done/avoided (status: true). JSON: {"action": "${ACTION_COMPLETE_ALL_HABITS_TODAY}"} (Requires confirmation)
// - SUGGEST HABITS: Suggest a mix of good/bad habits if appropriate. JSON: {"action": "${ACTION_SUGGEST_HABITS}", "habits": [{"title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}, ...]} (Requires confirmation)

// Respond ONLY with the JSON structure when performing an action. No extra text.
// `;

//   const historyForAPI = [
//     { role: "user", parts: [{ text: systemInstruction }] },
//     {
//       role: "model",
//       parts: [{ text: `Okay, I understand. I'm ready to help with habits!` }],
//     },
//     ...chatHistory.slice(-6).map((msg) => ({
//       role: msg.sender === "user" ? "user" : "model",
//       parts: [{ text: msg.text }],
//     })),
//     { role: "user", parts: [{ text: userMessage }] },
//   ];
//   const requestBody = {
//     contents: historyForAPI,
//     generationConfig: { maxOutputTokens: 300 },
//   };
//   console.log("Sending chat request body (shortened):", {
//     contents: [
//       { role: "user", parts: [{ text: "System Instruction..." }] },
//       ...historyForAPI.slice(-2),
//     ],
//   });

//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;
//       try {
//         const errorJson = await response.json();
//         errorBody = JSON.stringify(errorJson.error || errorJson);
//       } catch (e) {}
//       console.error("Gemini Chat API Error:", errorBody);
//       if (response.status === 400 || response.status === 403) {
//         return { text: "Chat Error: Invalid API Key or configuration." };
//       }
//       if (response.status === 429) {
//         return {
//           text: "Chat Error: API Quota Exceeded. Please try again later.",
//         };
//       }
//       throw new Error(`API request failed: ${errorBody}`);
//     }

//     const data = await response.json();
//     console.log("Received chat data:", data);

//     const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!chatResponseText) {
//       console.error("Could not parse chat response text:", data);
//       return { text: "Sorry, I couldn't process the AI response." };
//     }
//     console.log("Received raw chat response text:", chatResponseText);

//     let actionData = null;
//     let responseText = chatResponseText.trim();

//     // ** Enhanced JSON Parsing Logic **
//     const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
//     const fenceMatch = responseText.match(jsonFenceRegex);

//     if (fenceMatch && fenceMatch[1]) {
//       try {
//         const extractedJson = fenceMatch[1].trim();
//         const potentialJson = JSON.parse(extractedJson);
//         if (potentialJson?.action) {
//           actionData = potentialJson;
//           console.log("Parsed action JSON from fence:", actionData);
//           responseText = "";
//         } else {
//           console.warn(
//             "Parsed content within fence doesn't look like valid action JSON:",
//             potentialJson
//           );
//         }
//       } catch (e) {
//         console.warn("Failed to parse JSON within fence, treating as text:", e);
//       }
//     } else {
//       try {
//         const potentialJson = JSON.parse(responseText);
//         if (potentialJson?.action) {
//           actionData = potentialJson;
//           console.log("Parsed action JSON directly:", actionData);
//           responseText = "";
//         } else {
//           console.log("Direct parse doesn't look like valid action JSON.");
//         }
//       } catch (e) {
//         console.log("Response is not direct JSON, treating as text.");
//       }
//     }

//     if (actionData) {
//       actionData.title = actionData.title || null;
//       actionData.habits = actionData.habits || null;
//       actionData.startDate = actionData.startDate || null;
//       actionData.endDate = actionData.endDate || null;
//       actionData.date = actionData.date || null;
//       actionData.status = actionData.status ?? null;
//       actionData.type = actionData.type || "good"; // Default type if missing
//       return actionData;
//     } else {
//       return { text: responseText, action: ACTION_GENERAL_CHAT };
//     }
//   } catch (error) {
//     console.error("Error fetching chat response:", error);
//     if (
//       error.message.includes("Failed to fetch") ||
//       error.message.includes("NetworkError")
//     ) {
//       return { text: "Chat Error: Network issue. Please check connection." };
//     }
//     return { text: `Sorry, an error occurred while contacting the AI.` };
//   }
// }

// // --- Main App Component ---
// function App() {
//   // --- State Definitions ---
//   const [habits, setHabits] = useState([]);
//   const [habitLog, setHabitLog] = useState({});
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
//   const [editingHabit, setEditingHabit] = useState(null);
//   const [newHabitTitle, setNewHabitTitle] = useState("");
//   const [newHabitType, setNewHabitType] = useState("good");
//   const [newHabitStartDate, setNewHabitStartDate] = useState(
//     formatDate(new Date())
//   );
//   const [newHabitEndDate, setNewHabitEndDate] = useState("");
//   const [currentDate] = useState(new Date());
//   const [aiSuggestion, setAiSuggestion] = useState(
//     GEMINI_API_KEY ? "Loading suggestion..." : "AI features disabled."
//   );
//   const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isChatLoading, setIsChatLoading] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const chatMessagesEndRef = useRef(null);
//   const chatInputRef = useRef(null);
//   const [pendingActionData, setPendingActionData] = useState(null);
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [userName, setUserName] = useState("User");
//   const recognitionRef = useRef(null);
//   const [isListening, setIsListening] = useState(false);

//   // --- Effects ---
//   // Load data from localStorage on mount (with robust parsing)
//   useEffect(() => {
//     console.log("App Mounted: Loading data.");
//     let loadedHabits = [];
//     let loadedLog = {};
//     let loadedName = "User";
//     try {
//       const storedHabits = localStorage.getItem("dayPlannerHabits");
//       if (storedHabits) {
//         try {
//           const parsed = JSON.parse(storedHabits);
//           if (Array.isArray(parsed)) {
//             loadedHabits = parsed;
//             console.log(`Loaded ${loadedHabits.length} habits.`);
//           } else {
//             console.warn("Stored habits data is not an array.");
//           }
//         } catch (e) {
//           console.error("Failed to parse stored habits:", e);
//           localStorage.removeItem("dayPlannerHabits");
//         }
//       }
//     } catch (e) {
//       console.error("Error accessing habits from localStorage:", e);
//     }
//     try {
//       const storedHabitLog = localStorage.getItem("dayPlannerHabitLog");
//       if (storedHabitLog) {
//         try {
//           const parsed = JSON.parse(storedHabitLog);
//           if (typeof parsed === "object" && parsed !== null) {
//             loadedLog = parsed;
//             console.log(
//               `Loaded habit log for ${Object.keys(loadedLog).length} dates.`
//             );
//           } else {
//             console.warn("Stored habit log data is not an object.");
//           }
//         } catch (e) {
//           console.error("Failed to parse stored habit log:", e);
//           localStorage.removeItem("dayPlannerHabitLog");
//         }
//       }
//     } catch (e) {
//       console.error("Error accessing habit log from localStorage:", e);
//     }
//     try {
//       const storedName = localStorage.getItem("dayPlannerUserName");
//       if (storedName) {
//         loadedName = storedName;
//         console.log("Loaded name:", loadedName);
//       }
//     } catch (e) {
//       console.error("Error accessing username from localStorage:", e);
//     }
//     setHabits(loadedHabits);
//     setHabitLog(loadedLog);
//     setUserName(loadedName);
//     console.log("Initial data loading complete.");
//   }, []);

//   // Save data effects
//   useEffect(() => {
//     try {
//       if (habits.length > 0 || localStorage.getItem("dayPlannerHabits"))
//         localStorage.setItem("dayPlannerHabits", JSON.stringify(habits));
//     } catch (e) {
//       console.error("Save Habit Error:", e);
//     }
//   }, [habits]);
//   useEffect(() => {
//     try {
//       if (
//         Object.keys(habitLog).length > 0 ||
//         localStorage.getItem("dayPlannerHabitLog")
//       )
//         localStorage.setItem("dayPlannerHabitLog", JSON.stringify(habitLog));
//     } catch (e) {
//       console.error("Save Log Error:", e);
//     }
//   }, [habitLog]);
//   useEffect(() => {
//     if (userName !== "User")
//       try {
//         localStorage.setItem("dayPlannerUserName", userName);
//       } catch (e) {
//         console.error("Save Name Error:", e);
//       }
//   }, [userName]);

//   // Fetch AI Suggestion (Initial Load Only)
//   useEffect(() => {
//     if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
//       setAiSuggestion("AI features disabled.");
//       setIsLoadingSuggestion(false);
//       return;
//     }
//     console.log(`App loaded, fetching initial motivation.`);
//     setIsLoadingSuggestion(true);
//     setAiSuggestion("Getting suggestion...");
//     const timer = setTimeout(() => {
//       fetchMotivationSuggestion(habits, habitLog)
//         .then((suggestion) => {
//           setAiSuggestion(suggestion || "Could not get suggestion.");
//         })
//         .catch((error) => {
//           console.error("Motivation fetch error in useEffect:", error);
//           setAiSuggestion("Failed to get suggestion.");
//         })
//         .finally(() => {
//           setIsLoadingSuggestion(false);
//         });
//     }, 100);
//     return () => clearTimeout(timer);
//   }, []); // Fetch only once on initial load

//   // Scroll chat
//   useEffect(() => {
//     if (isChatOpen && chatHistory.length > 0) {
//       setTimeout(() => {
//         chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     }
//   }, [chatHistory, isChatOpen]);

//   // --- Habit Management Callbacks ---
//   const closeHabitModal = useCallback(() => {
//     console.log("Closing habit modal");
//     setIsHabitModalOpen(false);
//     setEditingHabit(null);
//     setNewHabitTitle("");
//     setNewHabitType("good");
//     setNewHabitStartDate(formatDate(new Date()));
//     setNewHabitEndDate("");
//   }, []);

//   const upsertHabit = useCallback(
//     (habitData) => {
//       try {
//         console.log("Upserting habit:", habitData);
//         const newHabit = {
//           id:
//             habitData.id ||
//             `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
//           title: (habitData.title || "").trim(),
//           type: habitData.type === "bad" ? "bad" : "good",
//           startDate: habitData.startDate || formatDate(new Date()),
//           endDate: habitData.endDate || null,
//         };
//         if (!newHabit.title) {
//           console.warn("Attempted to add habit without title.");
//           return;
//         }
//         if (newHabit.endDate && newHabit.startDate > newHabit.endDate) {
//           alert("Habit end date cannot be before the start date.");
//           return;
//         }
//         setHabits((prev) => {
//           const safePrev = Array.isArray(prev) ? prev : [];
//           const existingIndex = safePrev.findIndex((h) => h.id === newHabit.id);
//           let updatedHabits = [...safePrev];
//           if (existingIndex > -1) {
//             updatedHabits[existingIndex] = newHabit;
//           } else {
//             updatedHabits.push(newHabit);
//           }
//           updatedHabits.sort((a, b) => a.title.localeCompare(b.title));
//           console.log("Habits state updated:", updatedHabits.length);
//           return updatedHabits;
//         });
//       } catch (e) {
//         console.error("Upsert Habit Error:", e);
//       }
//     },
//     [setHabits]
//   );

//   const handleHabitModalSave = useCallback(() => {
//     console.log("Handling habit modal save");
//     if (!newHabitTitle.trim()) {
//       alert("Habit title required.");
//       return;
//     }
//     upsertHabit({
//       id: editingHabit?.id,
//       title: newHabitTitle,
//       type: newHabitType,
//       startDate: newHabitStartDate,
//       endDate: newHabitEndDate,
//     });
//     closeHabitModal();
//   }, [
//     upsertHabit,
//     editingHabit,
//     newHabitTitle,
//     newHabitType,
//     newHabitStartDate,
//     newHabitEndDate,
//     closeHabitModal,
//   ]);

//   const findHabitIdByTitle = useCallback(
//     (title) => {
//       if (!title || !Array.isArray(habits)) return null;
//       const searchTerm = title.trim().toLowerCase();
//       if (!searchTerm) return null;
//       const exactMatch = habits.find(
//         (h) => h.title.trim().toLowerCase() === searchTerm
//       );
//       if (exactMatch) {
//         console.log(`Found exact habit match: ${exactMatch.id}`);
//         return exactMatch.id;
//       }
//       const partialMatches = habits.filter((h) =>
//         h.title.trim().toLowerCase().includes(searchTerm)
//       );
//       if (partialMatches.length === 1) {
//         console.log(`Found partial habit match: ${partialMatches[0].id}`);
//         return partialMatches[0].id;
//       }
//       if (partialMatches.length > 1) {
//         console.warn(`Ambiguous habit title: ${title}`);
//         return null;
//       }
//       console.log(`Habit not found: ${title}`);
//       return null;
//     },
//     [habits]
//   );

//   const handleDeleteHabitCallback = useCallback(
//     (id) => {
//       try {
//         if (!id) return;
//         console.log("Deleting habit:", id);
//         setHabits((prev) =>
//           (Array.isArray(prev) ? prev : []).filter((h) => h.id !== id)
//         );
//         setHabitLog((prevLog) => {
//           const newLog = { ...(prevLog || {}) };
//           Object.keys(newLog).forEach((date) => {
//             if (newLog[date]?.[id] !== undefined) {
//               delete newLog[date][id];
//               if (Object.keys(newLog[date]).length === 0) delete newLog[date];
//             }
//           });
//           console.log(
//             "Habit log updated after delete:",
//             Object.keys(newLog).length
//           );
//           return newLog;
//         });
//       } catch (e) {
//         console.error("Delete Habit Error:", e);
//       }
//     },
//     [setHabits, setHabitLog]
//   );

//   const openModalForEditHabit = useCallback((habit) => {
//     console.log("Opening habit modal for edit:", habit);
//     setEditingHabit(habit);
//     setNewHabitTitle(habit.title);
//     setNewHabitType(habit.type || "good");
//     setNewHabitStartDate(habit.startDate);
//     setNewHabitEndDate(habit.endDate || "");
//     setIsHabitModalOpen(true);
//   }, []);

//   const openModalForNewHabit = useCallback(() => {
//     console.log("Opening habit modal for new");
//     setEditingHabit(null);
//     setNewHabitTitle("");
//     setNewHabitType("good");
//     setNewHabitStartDate(formatDate(new Date()));
//     setNewHabitEndDate("");
//     setIsHabitModalOpen(true);
//   }, []);

//   const setHabitCompletionStatus = useCallback(
//     (habitId, date, desiredStatus) => {
//       try {
//         const dateStr = formatDate(date);
//         if (!dateStr || !habitId) return;
//         console.log(
//           `Setting habit ${habitId} for ${dateStr} to ${desiredStatus}`
//         );
//         setHabitLog((prevLog) => {
//           const safePrevLog = prevLog || {};
//           const dayLog = { ...(safePrevLog[dateStr] || {}) };
//           const currentStatus = dayLog[habitId];
//           if (currentStatus === desiredStatus) delete dayLog[habitId];
//           else dayLog[habitId] = desiredStatus;
//           const newLog = { ...safePrevLog };
//           if (Object.keys(dayLog).length === 0) delete newLog[dateStr];
//           else newLog[dateStr] = dayLog;
//           console.log("Habit log updated:", Object.keys(newLog).length);
//           return newLog;
//         });
//       } catch (e) {
//         console.error("Set Habit Status Error:", e);
//       }
//     },
//     [setHabitLog]
//   );

//   // --- Chat Handling (More Robust Error Catching & Action Handling) ---
//   const handleSendChatMessage = useCallback(async () => {
//     const messageText = chatInput.trim();
//     console.log(
//       `handleSendChatMessage called. Message: "${messageText}", Awaiting: ${awaitingConfirmation}`
//     );
//     if (!messageText && !awaitingConfirmation) return;
//     if (isChatLoading) {
//       console.log("Chat is already loading.");
//       return;
//     }

//     const newUserMessage = { sender: "user", text: messageText };

//     // --- Confirmation Flow ---
//     if (awaitingConfirmation && pendingActionData) {
//       console.log("Processing confirmation...");
//       try {
//         setChatHistory((prev) => [...prev, newUserMessage]);
//         setChatInput("");
//         const userConfirmation = messageText.toLowerCase();
//         let confirmationResponseText = "";
//         let performAction = false;
//         if (userConfirmation === "yes" || userConfirmation === "y")
//           performAction = true;
//         else if (userConfirmation === "no" || userConfirmation === "n")
//           confirmationResponseText = "Okay, action cancelled.";
//         else {
//           confirmationResponseText = `Please confirm with 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;
//         }

//         if (performAction) {
//           try {
//             // Wrap action execution
//             console.log(
//               "Performing confirmed action:",
//               pendingActionData.action
//             );
//             switch (pendingActionData.action) {
//               case ACTION_DELETE_HABIT:
//                 pendingActionData.habitIds?.forEach((id) =>
//                   handleDeleteHabitCallback(id)
//                 );
//                 confirmationResponseText = `Okay, deleted habit(s).`;
//                 break;
//               case ACTION_SUGGEST_HABITS:
//                 pendingActionData.habits?.forEach((h) => upsertHabit(h));
//                 confirmationResponseText = `Okay, added suggested habit(s).`;
//                 break;
//               case ACTION_DELETE_ALL_HABITS:
//                 console.log("Deleting all habits confirmed.");
//                 setHabits([]);
//                 setHabitLog({});
//                 confirmationResponseText = "Okay, deleted all habits.";
//                 break;
//               case ACTION_COMPLETE_ALL_HABITS_TODAY:
//                 console.log("Completing all habits for today confirmed.");
//                 const todayStr = formatDate(new Date());
//                 // ** Robust calculation for active habit IDs **
//                 const activeHabitsToday = (
//                   Array.isArray(habits) ? habits : []
//                 ).filter((h) => {
//                   if (!h || !h.startDate) return false;
//                   try {
//                     const s = parseDate(h.startDate);
//                     const e = h.endDate ? parseDate(h.endDate) : null;
//                     const today = parseDate(todayStr);
//                     if (!s || !today) return false;
//                     if (h.endDate && !e) return false;
//                     return today >= s && (!e || today <= e);
//                   } catch (filterError) {
//                     console.error(
//                       "Error filtering habit in COMPLETE_ALL:",
//                       h,
//                       filterError
//                     );
//                     return false;
//                   }
//                 });
//                 const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
//                   ? activeHabitsToday
//                       .map((h) => h && h.id)
//                       .filter((id) => id != null)
//                   : []; // Defensive map and filter nulls
//                 // ** End Robust calculation **

//                 if (!Array.isArray(activeHabitsTodayIds)) {
//                   console.error(
//                     "Error: activeHabitsTodayIds is not an array in COMPLETE_ALL action."
//                   );
//                   confirmationResponseText = "Error processing active habits.";
//                 } else if (activeHabitsTodayIds.length > 0) {
//                   activeHabitsTodayIds.forEach((id) =>
//                     setHabitCompletionStatus(id, new Date(), true)
//                   );
//                   confirmationResponseText = `Okay, marked all ${activeHabitsTodayIds.length} active habits for today as complete/avoided.`;
//                 } else {
//                   confirmationResponseText =
//                     "No habits were active today to mark as complete.";
//                 }
//                 break;
//               default:
//                 confirmationResponseText = "Action confirmed (unknown type).";
//                 console.warn(
//                   "Confirmed unknown action type:",
//                   pendingActionData.action
//                 );
//             }
//           } catch (error) {
//             console.error("Error performing confirmed action:", error);
//             confirmationResponseText =
//               "Sorry, there was an error performing the action.";
//           }
//         }
//         if (confirmationResponseText) {
//           setChatHistory((prev) => [
//             ...prev,
//             { sender: "bot", text: confirmationResponseText },
//           ]);
//         }
//         if (
//           performAction ||
//           userConfirmation === "no" ||
//           userConfirmation === "n"
//         ) {
//           setPendingActionData(null);
//           setAwaitingConfirmation(false);
//         }
//       } catch (error) {
//         console.error("Error during confirmation flow:", error);
//         setChatHistory((prev) => [
//           ...prev,
//           { sender: "bot", text: "An error occurred during confirmation." },
//         ]);
//         setPendingActionData(null);
//         setAwaitingConfirmation(false);
//       } finally {
//         setTimeout(() => chatInputRef.current?.focus(), 0);
//       }
//       return;
//     }

//     // --- Regular Chat / New Action Request ---
//     console.log("Processing new chat message...");
//     setIsChatLoading(true);
//     setChatHistory((prev) => [...prev, newUserMessage]);
//     setChatInput("");

//     try {
//       const currentChatHistory = [...chatHistory, newUserMessage];
//       console.log("Calling fetchChatResponse...");
//       const botResponse = await fetchChatResponse(
//         habits,
//         habitLog,
//         currentChatHistory,
//         messageText,
//         userName
//       );
//       console.log("Received bot response object:", botResponse);

//       let requiresConfirmation = false;
//       let confirmationPrompt = "";
//       let chatMessageToAdd = "";
//       let actionDataForConfirmation = null;

//       if (!botResponse || (!botResponse.action && !botResponse.text)) {
//         throw new Error("Invalid or empty bot response received.");
//       }

//       if (botResponse.action && botResponse.action !== ACTION_GENERAL_CHAT) {
//         console.log(`AI detected action: ${botResponse.action}`);
//         actionDataForConfirmation = {
//           action: botResponse.action,
//           confirmationPrompt: "",
//         };
//         try {
//           // Wrap action processing
//           switch (botResponse.action) {
//             case ACTION_ADD_HABIT:
//               upsertHabit({
//                 title: botResponse.title,
//                 type: botResponse.type,
//                 startDate: botResponse.startDate,
//                 endDate: botResponse.endDate,
//               });
//               chatMessageToAdd = `Okay, added habit "${botResponse.title}".`;
//               break;
//             case ACTION_DELETE_HABIT:
//               const habitIdToDelete = findHabitIdByTitle(botResponse.title);
//               if (habitIdToDelete) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Delete habit "${botResponse.title}" and all its logs? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   habitIds: [habitIdToDelete],
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = `Couldn't find habit "${botResponse.title}".`;
//               }
//               break;
//             case ACTION_COMPLETE_HABIT_DATE:
//               const habitIdToLog = findHabitIdByTitle(botResponse.title);
//               const dateToLog = botResponse.date || formatDate(new Date());
//               const statusToLog = botResponse.status;
//               const parsedDate = parseDate(dateToLog);
//               if (habitIdToLog && parsedDate && statusToLog !== null) {
//                 setHabitCompletionStatus(habitIdToLog, parsedDate, statusToLog);
//                 chatMessageToAdd = `Okay, marked habit "${
//                   botResponse.title
//                 }" as ${
//                   statusToLog ? "done/avoided" : "missed/indulged"
//                 } for ${dateToLog}.`;
//               } else {
//                 chatMessageToAdd = `Couldn't log habit "${botResponse.title}" for ${dateToLog}. Check title/date format (YYYY-MM-DD).`;
//               }
//               break;
//             case ACTION_SUGGEST_HABITS:
//               if (botResponse.habits?.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `AI suggests adding habits: ${botResponse.habits
//                   .map((h) => `"${h.title}"`)
//                   .join(", ")}. Add them? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   habits: botResponse.habits,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "AI couldn't suggest habits.";
//               }
//               break;
//             case ACTION_DELETE_ALL_HABITS:
//               if (habits.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Are you sure you want to delete all ${habits.length} habits and their logs? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "You don't have any habits to delete.";
//               }
//               break;
//             case ACTION_COMPLETE_ALL_HABITS_TODAY:
//               const todayStr = formatDate(new Date());
//               // ** Robust calculation for active habit IDs **
//               const activeHabitsToday = (
//                 Array.isArray(habits) ? habits : []
//               ).filter((h) => {
//                 if (!h || !h.startDate) return false;
//                 try {
//                   const s = parseDate(h.startDate);
//                   const e = h.endDate ? parseDate(h.endDate) : null;
//                   const today = parseDate(todayStr);
//                   if (!s || !today) return false;
//                   if (h.endDate && !e) return false;
//                   return today >= s && (!e || today <= e);
//                 } catch (filterError) {
//                   console.error(
//                     "Error filtering habit in COMPLETE_ALL:",
//                     h,
//                     filterError
//                   );
//                   return false;
//                 }
//               });
//               const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
//                 ? activeHabitsToday
//                     .map((h) => h && h.id)
//                     .filter((id) => id != null)
//                 : [];
//               // ** End Robust calculation **
//               if (!Array.isArray(activeHabitsTodayIds)) {
//                 console.error(
//                   "Error: activeHabitsTodayIds is not an array in COMPLETE_ALL action check."
//                 );
//                 chatMessageToAdd = "Error calculating active habits.";
//               } else if (activeHabitsTodayIds.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Mark all ${activeHabitsTodayIds.length} active habits for today as done/avoided? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "No habits are active today.";
//               }
//               break;
//             default:
//               chatMessageToAdd = "Sorry, I received an unknown habit action.";
//               console.warn("Unknown action:", botResponse.action);
//           }
//         } catch (actionError) {
//           console.error(
//             `Error processing action ${botResponse.action}:`,
//             actionError
//           );
//           chatMessageToAdd = `Sorry, error processing action: ${botResponse.action}.`;
//           requiresConfirmation = false;
//         }

//         if (
//           requiresConfirmation &&
//           actionDataForConfirmation?.confirmationPrompt
//         ) {
//           setPendingActionData(actionDataForConfirmation);
//           setAwaitingConfirmation(true);
//           chatMessageToAdd = confirmationPrompt;
//           console.log("Set state for confirmation:", actionDataForConfirmation);
//         }
//       } else {
//         // General Chat
//         chatMessageToAdd =
//           botResponse.text || "Sorry, I didn't understand that.";
//         console.log("Handling general chat response.");
//         const lowerCaseMsg = messageText.toLowerCase();
//         if (
//           lowerCaseMsg.startsWith("my name is ") ||
//           lowerCaseMsg.startsWith("i'm ") ||
//           lowerCaseMsg.startsWith("im ")
//         ) {
//           const potentialName = messageText
//             .substring(messageText.lastIndexOf(" ") + 1)
//             .replace(/[^a-zA-Z]/g, "");
//           if (potentialName?.length > 1) {
//             const name =
//               potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
//             setUserName(name);
//             console.log(`Potential name detected and set: ${name}`);
//             chatMessageToAdd = `Nice to meet you, ${name}! How can I help with your habits?`;
//           }
//         }
//       }

//       if (chatMessageToAdd) {
//         console.log("Adding bot message to chat:", chatMessageToAdd);
//         setChatHistory((prev) => [
//           ...prev,
//           { sender: "bot", text: chatMessageToAdd },
//         ]);
//       } else if (!requiresConfirmation) {
//         console.warn("No chat message generated:", botResponse);
//       }
//     } catch (error) {
//       console.error("Critical Error in handleSendChatMessage:", error);
//       try {
//         setChatHistory((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: "A critical error occurred. Please check the console.",
//           },
//         ]);
//       } catch (e) {}
//     } finally {
//       setIsChatLoading(false);
//       if (!awaitingConfirmation) {
//         try {
//           setTimeout(() => chatInputRef.current?.focus(), 0);
//         } catch (e) {}
//       }
//       console.log("handleSendChatMessage finished.");
//     }
//   }, [
//     chatInput,
//     chatHistory,
//     habits,
//     habitLog,
//     isChatLoading,
//     upsertHabit,
//     findHabitIdByTitle,
//     handleDeleteHabitCallback,
//     setHabitCompletionStatus,
//     awaitingConfirmation,
//     pendingActionData,
//     userName,
//     setUserName,
//     setHabits,
//     setHabitLog,
//   ]);

//   const handleChatInputKeyPress = (event) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault();
//       handleSendChatMessage();
//     }
//   };

//   // --- Toggle Chat ---
//   const toggleChat = useCallback(() => {
//     console.log("Toggling chat visibility");
//     setIsChatOpen((prev) => !prev);
//   }, []);

//   // --- Voice Input Logic ---
//   const setupSpeechRecognition = useCallback(() => {
//     const SpeechRecognitionAPI =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognitionAPI) {
//       console.warn("Speech Recognition API not supported.");
//       return;
//     }
//     const recognition = new SpeechRecognitionAPI();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";
//     recognition.onstart = () => {
//       setIsListening(true);
//       console.log("Voice started.");
//       setChatInput("Listening...");
//     };
//     recognition.onresult = (event) => {
//       const transcript =
//         event.results[event.results.length - 1][0].transcript.trim();
//       console.log("Voice transcript:", transcript);
//       setChatInput(transcript);
//     };
//     recognition.onerror = (event) => {
//       console.error("Speech error:", event.error);
//       let errorMsg = `Speech error: ${event.error}`;
//       if (event.error === "not-allowed") {
//         errorMsg = "Mic permission denied.";
//       } else if (event.error === "no-speech") {
//         errorMsg = "No speech detected.";
//       }
//       setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
//       setIsListening(false);
//     };
//     recognition.onend = () => {
//       console.log("Voice ended.");
//       setIsListening(false);
//       chatInputRef.current?.focus();
//     };
//     recognitionRef.current = recognition;
//   }, [setChatHistory, setChatInput]);

//   useEffect(() => {
//     setupSpeechRecognition();
//     return () => {
//       recognitionRef.current?.abort();
//     };
//   }, [setupSpeechRecognition]);

//   const handleMicClick = () => {
//     if (!recognitionRef.current) {
//       console.warn("Speech recognition not initialized.");
//       return;
//     }
//     if (isListening) {
//       recognitionRef.current.stop();
//     } else {
//       navigator.mediaDevices
//         .getUserMedia({ audio: true })
//         .then(() => {
//           setChatInput("");
//           recognitionRef.current.start();
//         })
//         .catch((err) => {
//           console.error("Mic access denied:", err);
//           setChatHistory((prev) => [
//             ...prev,
//             { sender: "bot", text: "Mic access denied." },
//           ]);
//         });
//     }
//   };

//   // --- Memoized Values ---
//   const activeHabitsForSelectedDate = useMemo(() => {
//     try {
//       const selectedD = parseDate(formatDate(selectedDate));
//       if (!selectedD || !Array.isArray(habits)) return [];
//       return habits.filter((h) => {
//         const startD = parseDate(h.startDate);
//         const endD = h.endDate ? parseDate(h.endDate) : null;
//         if (!startD) return false;
//         return selectedD >= startD && (!endD || selectedD <= endD);
//       });
//     } catch (error) {
//       console.error("Error calculating active habits:", error);
//       return [];
//     }
//   }, [habits, selectedDate]);

//   // --- Calendar Tile Styling ---
//   const getTileClassName = ({ date, view: calendarView }) => {
//     try {
//       if (calendarView !== "month") return null;
//       const dateStr = formatDate(date);
//       if (!dateStr) return null;
//       const logForDay = habitLog?.[dateStr];
//       const safeHabits = Array.isArray(habits) ? habits : [];
//       const habitsForDay = safeHabits.filter((h) => {
//         const s = parseDate(h.startDate);
//         const e = h.endDate ? parseDate(h.endDate) : null;
//         const c = parseDate(dateStr);
//         return s && c && c >= s && (!e || c <= e);
//       });
//       if (habitsForDay.length === 0) return null;
//       const completedCount = habitsForDay.filter(
//         (h) => logForDay?.[h.id] === true
//       ).length;
//       const missedCount = habitsForDay.filter(
//         (h) => logForDay?.[h.id] === false
//       ).length;
//       const loggedCount = completedCount + missedCount;
//       if (completedCount === habitsForDay.length)
//         return "habit-day-all-complete";
//       if (loggedCount === habitsForDay.length && loggedCount > 0)
//         return "habit-day-all-missed";
//       if (loggedCount > 0) return "habit-day-partial-log";
//       return null;
//     } catch (error) {
//       console.error("Error in getTileClassName:", error);
//       return null;
//     }
//   };

//   // --- Render JSX ---
//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
//       {/* Header */}
//       <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//         <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
//           <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
//             {" "}
//             Habit Tracker{" "}
//           </h1>
//           <div className="text-right hidden sm:block">
//             <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//               {getGreeting()}, {userName}!
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               {currentDate.toLocaleDateString(undefined, {
//                 weekday: "long",
//                 month: "long",
//                 day: "numeric",
//               })}
//             </p>
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden relative">
//         {/* Left Column: Calendar & Daily Log */}
//         <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//           {/* Calendar Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <CalendarIcon
//                   size={20}
//                   className="text-purple-600 dark:text-purple-400"
//                 />{" "}
//                 Habit Calendar
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="flex justify-center">
//               <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
//                 {/* ** Removed conditional check - Directly rendering Calendar ** */}
//                 {/* This assumes 'Calendar' is successfully imported */}
//                 {/* If this causes errors, ensure 'react-calendar' is installed AND imported correctly */}
//                 <Calendar
//                   onChange={setSelectedDate}
//                   value={selectedDate}
//                   tileClassName={getTileClassName}
//                   maxDate={new Date()}
//                   className="text-sm"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           {/* Daily Habit Log Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90">
//             <CardHeader>
//               <CardTitle className="text-lg">
//                 Log for {formatDate(selectedDate)}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {" "}
//               {activeHabitsForSelectedDate.length > 0 ? (
//                 <ul className="space-y-3">
//                   {" "}
//                   {activeHabitsForSelectedDate.map((habit) => {
//                     const logStatus =
//                       habitLog[formatDate(selectedDate)]?.[habit.id];
//                     return (
//                       <li
//                         key={habit.id}
//                         className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
//                       >
//                         {" "}
//                         <span className="font-medium text-sm md:text-base">
//                           {habit.title}
//                         </span>{" "}
//                         <div className="flex items-center space-x-2 flex-shrink-0">
//                           {" "}
//                           <Button
//                             variant={logStatus === true ? "default" : "outline"}
//                             size="sm"
//                             onClick={() =>
//                               setHabitCompletionStatus(
//                                 habit.id,
//                                 selectedDate,
//                                 true
//                               )
//                             }
//                             className={`w-20 ${
//                               logStatus === true
//                                 ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
//                                 : ""
//                             }`}
//                             aria-label={`Mark ${habit.title} as done`}
//                           >
//                             {" "}
//                             <CheckCircle size={16} className="mr-1" /> Done{" "}
//                           </Button>{" "}
//                           <Button
//                             variant={
//                               logStatus === false ? "destructive" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setHabitCompletionStatus(
//                                 habit.id,
//                                 selectedDate,
//                                 false
//                               )
//                             }
//                             className={`w-20 ${
//                               logStatus === false
//                                 ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
//                                 : ""
//                             }`}
//                             aria-label={`Mark ${habit.title} as missed`}
//                           >
//                             {" "}
//                             <XCircle size={16} className="mr-1" /> Missed{" "}
//                           </Button>{" "}
//                         </div>{" "}
//                       </li>
//                     );
//                   })}{" "}
//                 </ul>
//               ) : (
//                 <p className="text-center text-gray-500 dark:text-gray-400 py-4">
//                   No habits scheduled for this date.
//                 </p>
//               )}{" "}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column: Habit Management & AI Suggestion */}
//         <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col overflow-hidden">
//           {/* Habit AI Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Brain size={20} className="text-blue-500" /> Habit Assistant
//               </CardTitle>
//             </CardHeader>{" "}
//             <CardContent className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-start gap-2 shadow-sm border border-blue-200 dark:border-blue-800 flex-1 min-w-0">
//               {" "}
//               <Brain
//                 size={20}
//                 className={`flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 ${
//                   isLoadingSuggestion ? "animate-pulse" : ""
//                 }`}
//               />{" "}
//               <span className="italic whitespace-pre-line text-xs sm:text-sm">
//                 {isLoadingSuggestion ? "Getting suggestion..." : aiSuggestion}
//               </span>{" "}
//             </CardContent>{" "}
//             <CardFooter>
//               <Button
//                 onClick={openModalForNewHabit}
//                 className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
//               >
//                 <Plus size={18} className="mr-2" /> Add New Habit
//               </Button>
//             </CardFooter>
//           </Card>
//           {/* Habit List Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col flex-grow overflow-hidden">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Settings
//                   size={20}
//                   className="text-gray-600 dark:text-gray-400"
//                 />{" "}
//                 Manage Habits
//               </CardTitle>
//             </CardHeader>{" "}
//             <CardContent className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//               {" "}
//               {habits.length > 0 ? (
//                 <ul className="space-y-2">
//                   {" "}
//                   {habits.map((habit) => (
//                     <li
//                       key={habit.id}
//                       className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 group"
//                     >
//                       {" "}
//                       <div className="flex items-center space-x-2 text-sm">
//                         {" "}
//                         {habit.type === "bad" ? (
//                           <ThumbsDown
//                             size={16}
//                             className="text-red-500 flex-shrink-0"
//                           />
//                         ) : (
//                           <ThumbsUp
//                             size={16}
//                             className="text-green-500 flex-shrink-0"
//                           />
//                         )}{" "}
//                         <div>
//                           {" "}
//                           <span className="font-medium block">
//                             {habit.title}
//                           </span>{" "}
//                           <span className="text-xs text-gray-500 dark:text-gray-400">
//                             {" "}
//                             {habit.startDate} to {habit.endDate || "Ongoing"}{" "}
//                           </span>{" "}
//                         </div>{" "}
//                       </div>{" "}
//                       <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
//                         {" "}
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-gray-500 hover:text-blue-600 h-7 w-7"
//                           onClick={() => openModalForEditHabit(habit)}
//                           aria-label={`Edit habit ${habit.title}`}
//                         >
//                           <Edit size={14} />
//                         </Button>{" "}
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-gray-500 hover:text-red-600 h-7 w-7"
//                           onClick={() => handleDeleteHabitCallback(habit.id)}
//                           aria-label={`Delete habit ${habit.title}`}
//                         >
//                           <Trash2 size={14} />
//                         </Button>{" "}
//                       </div>{" "}
//                     </li>
//                   ))}{" "}
//                 </ul>
//               ) : (
//                 <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 flex flex-col items-center gap-2">
//                   {" "}
//                   <Info size={24} /> <span>No habits defined yet.</span>{" "}
//                   <span>Click "Add New Habit" or ask the AI!</span>{" "}
//                 </div>
//               )}{" "}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Floating Action Button for Chat */}
//         {!isChatOpen && (
//           <Button
//             onClick={toggleChat}
//             variant="default"
//             size="icon"
//             className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition-transform hover:scale-110"
//             aria-label="Open Chat Assistant"
//           >
//             {" "}
//             <MessageSquare size={24} />{" "}
//           </Button>
//         )}
//       </main>

//       {/* Chat Window (Drawer) */}
//       {isChatOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//             onClick={toggleChat}
//             aria-hidden="true"
//           ></div>
//           <div
//             className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white dark:bg-gray-900 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
//               isChatOpen ? "translate-x-0" : "translate-x-full"
//             }`}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="chat-title"
//           >
//             <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
//               <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between p-4">
//                 <CardTitle
//                   id="chat-title"
//                   className="flex items-center gap-2 text-lg"
//                 >
//                   {" "}
//                   <MessageSquare
//                     size={20}
//                     className="text-indigo-600 dark:text-indigo-400"
//                   />{" "}
//                   Habit Assistant{" "}
//                 </CardTitle>
//                 <Button
//                   onClick={toggleChat}
//                   variant="ghost"
//                   size="icon"
//                   aria-label="Close Chat"
//                 >
//                   {" "}
//                   <X size={20} />{" "}
//                 </Button>
//               </CardHeader>
//               <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                 {chatHistory.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`flex items-start gap-2.5 ${
//                       msg.sender === "user" ? "justify-end" : ""
//                     }`}
//                   >
//                     {" "}
//                     {msg.sender === "bot" && (
//                       <Bot
//                         size={24}
//                         className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900"
//                       />
//                     )}{" "}
//                     <div
//                       className={`p-2.5 rounded-lg max-w-[85%] shadow-sm ${
//                         msg.sender === "user"
//                           ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
//                           : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                       }`}
//                     >
//                       <ReactMarkdown
//                         className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1"
//                         components={{
//                           a: ({ node, ...props }) => (
//                             <a
//                               {...props}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 dark:text-blue-400 hover:underline"
//                             />
//                           ),
//                         }}
//                       >
//                         {msg.text}
//                       </ReactMarkdown>
//                     </div>{" "}
//                     {msg.sender === "user" && (
//                       <User
//                         size={24}
//                         className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-blue-100 dark:bg-blue-900"
//                       />
//                     )}{" "}
//                   </div>
//                 ))}
//                 {isChatLoading && (
//                   <div className="flex items-start gap-2.5">
//                     <Bot
//                       size={24}
//                       className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse"
//                     />
//                     <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic">
//                       Assistant is thinking...
//                     </div>
//                   </div>
//                 )}
//                 <div ref={chatMessagesEndRef} />
//               </CardContent>
//               <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4 bg-white dark:bg-gray-900 flex-shrink-0">
//                 <div className="flex w-full items-center space-x-2">
//                   {" "}
//                   <Input
//                     ref={chatInputRef}
//                     type="text"
//                     placeholder={
//                       isListening
//                         ? "Listening..."
//                         : awaitingConfirmation
//                         ? "Confirm (yes/no)..."
//                         : `Ask about habits...`
//                     }
//                     className="flex-1"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     onKeyPress={handleChatInputKeyPress}
//                     disabled={isChatLoading && !awaitingConfirmation}
//                     aria-label="Chat input"
//                   />{" "}
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={handleMicClick}
//                     disabled={isChatLoading}
//                     className={`text-gray-500 hover:text-indigo-600 ${
//                       isListening ? "text-red-500 animate-pulse" : ""
//                     }`}
//                     title={isListening ? "Stop Listening" : "Start Listening"}
//                     aria-label={
//                       isListening ? "Stop listening" : "Start voice input"
//                     }
//                   >
//                     {" "}
//                     {isListening ? (
//                       <MicOff size={18} />
//                     ) : (
//                       <Mic size={18} />
//                     )}{" "}
//                   </Button>{" "}
//                   <Button
//                     size="icon"
//                     onClick={handleSendChatMessage}
//                     disabled={
//                       (!chatInput.trim() && !awaitingConfirmation) ||
//                       (isChatLoading && !awaitingConfirmation)
//                     }
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
//                     aria-label="Send chat message"
//                   >
//                     {" "}
//                     <Send size={18} />{" "}
//                   </Button>{" "}
//                 </div>
//               </CardFooter>
//             </Card>
//           </div>
//         </>
//       )}

//       {/* Add/Edit Habit Modal */}
//       <Dialog open={isHabitModalOpen} onClose={closeHabitModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {editingHabit ? "Edit Habit" : "Add New Habit"}
//             </DialogTitle>
//           </DialogHeader>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleHabitModalSave();
//             }}
//           >
//             <div className="space-y-4">
//               <div>
//                 <label
//                   htmlFor="habit-title-modal"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Title <span className="text-red-500">*</span>
//                 </label>
//                 <Input
//                   id="habit-title-modal"
//                   value={newHabitTitle}
//                   onChange={(e) => setNewHabitTitle(e.target.value)}
//                   placeholder="E.g., Exercise daily"
//                   className="w-full"
//                   autoFocus
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Habit Type
//                 </label>
//                 <RadioGroup
//                   value={newHabitType}
//                   onValueChange={setNewHabitType}
//                   className="flex space-x-4"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem
//                       value="good"
//                       id="type-good"
//                       checked={newHabitType === "good"}
//                       onChange={(e) => setNewHabitType(e.target.value)}
//                     />
//                     <label
//                       htmlFor="type-good"
//                       className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       Build Good Habit
//                     </label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem
//                       value="bad"
//                       id="type-bad"
//                       checked={newHabitType === "bad"}
//                       onChange={(e) => setNewHabitType(e.target.value)}
//                     />
//                     <label
//                       htmlFor="type-bad"
//                       className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       Break Bad Habit
//                     </label>
//                   </div>
//                 </RadioGroup>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label
//                     htmlFor="habit-start-modal"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                   >
//                     Start Date <span className="text-red-500">*</span>
//                   </label>
//                   <Input
//                     id="habit-start-modal"
//                     type="date"
//                     value={newHabitStartDate}
//                     onChange={(e) => setNewHabitStartDate(e.target.value)}
//                     className="w-full"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label
//                     htmlFor="habit-end-modal"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                   >
//                     End Date <span className="text-xs">(Optional)</span>
//                   </label>
//                   <Input
//                     id="habit-end-modal"
//                     type="date"
//                     value={newHabitEndDate}
//                     onChange={(e) => setNewHabitEndDate(e.target.value)}
//                     className="w-full"
//                     min={newHabitStartDate}
//                   />
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={closeHabitModal}>
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-purple-600 text-white">
//                 {editingHabit ? "Save Changes" : "Add Habit"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Custom CSS for Calendar and Scrollbars */}
//       <style>{`
//         .react-calendar-wrapper { max-width: 100%; padding: 0rem; }
//         .react-calendar { width: 100% !important; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: transparent; font-family: inherit; }
//         .dark .react-calendar { border-color: #374151; }
//         .react-calendar__navigation button { min-width: 40px; color: #374151; }
//         .dark .react-calendar__navigation button { color: #d1d5db; }
//         .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; }
//         .dark .react-calendar__navigation button:enabled:hover, .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; }
//         .react-calendar__month-view__weekdays__weekday { color: #6b7280; text-align: center; font-weight: bold; text-decoration: none; padding: 0.5em; }
//         .dark .react-calendar__month-view__weekdays__weekday { color: #9ca3af; }
//         .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; }
//         .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; }
//         .react-calendar__tile { border-radius: 0.375rem; transition: background-color 0.2s; padding: 0.5em 0.5em; line-height: 1.2; border: 1px solid transparent; text-align: center; }
//         .dark .react-calendar__tile { color: #e5e7eb; }
//         .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #e5e7eb; }
//         .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus { background-color: #374151; }
//         .react-calendar__tile--now { background: #dbeafe !important; font-weight: bold; }
//         .dark .react-calendar__tile--now { background: #1e3a8a !important; }
//         .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
//         .dark .react-calendar__tile--active { background: #60a5fa !important; color: #1f2937 !important; }
//         .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #2563eb !important; }
//         .dark .react-calendar__tile--active:enabled:hover, .dark .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; }
//         /* Custom Habit Day Styles */
//         .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; }
//         .habit-day-some-complete { background-color: #fef9c3 !important; border-color: #fde047 !important; color: #854d0e !important; }
//         .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
//         .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; }
//         /* Dark mode Habit Styles */
//         .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }
//         .dark .habit-day-some-complete { background-color: #78350f !important; border-color: #fbbf24 !important; color: #fef08a !important; }
//         .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }
//         .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }
//         /* Scrollbar styling */
//         .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
//         .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; }
//         .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 0.25rem; }
//         .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 0.25rem; }
//         .scrollbar-track-transparent::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
//         .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; }
//         ::-webkit-scrollbar-track { background: transparent; }
//       `}</style>
//     </div>
//   );
// }

// export default App;

////Version -3

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import ReactMarkdown from "react-markdown";

// // --- Calendar Component ---
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

// // --- Icons ---
// import {
//   Calendar as CalendarIcon,
//   Plus,
//   Trash2,
//   Edit,
//   CheckCircle,
//   XCircle,
//   Brain,
//   MessageSquare,
//   Send,
//   User,
//   Bot,
//   X,
//   Mic,
//   MicOff,
//   Repeat,
//   Zap,
//   Settings,
//   Info,
//   AlertTriangle,
//   TrendingUp,
//   TrendingDown,
//   ThumbsUp,
//   ThumbsDown,
//   Sun, // NEW: Icon for Light Mode
//   Moon, // NEW: Icon for Dark Mode
// } from "lucide-react";

// // --- Dark Mode Hook ---
// import { useDarkMode } from "./useDarkMode"; // Adjust path if needed

// // --- Hardcoded API Key ---
// const GEMINI_API_KEY = "AIzaSyDRSwIOzdttALUQtOXkPkhgTvG5w-oOxeU"; // Replace later
// console.warn(
//   "Using hardcoded GEMINI_API_KEY for development. Replace before production!"
// );
// const GEMINI_API_ENDPOINT = GEMINI_API_KEY
//   ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`
//   : "";

// // --- Action Constants ---
// const ACTION_ADD_HABIT = "add_habit";
// const ACTION_DELETE_HABIT = "delete_habit";
// const ACTION_COMPLETE_HABIT_DATE = "complete_habit_date";
// const ACTION_SUGGEST_HABITS = "suggest_habits";
// const ACTION_GENERAL_CHAT = "general_chat";
// const ACTION_DELETE_ALL_HABITS = "delete_all_habits";
// const ACTION_COMPLETE_ALL_HABITS_TODAY = "complete_all_habits_today";

// // --- Date/Time Helpers ---
// const formatDate = (date) => {
//   if (!(date instanceof Date) || isNaN(date)) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };
// const parseDate = (dateString) => {
//   if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
//   const [year, month, day] = dateString.split("-").map(Number);
//   const date = new Date(Date.UTC(year, month - 1, day));
//   return isNaN(date.getTime()) ? null : date;
// };

// // --- Mock shadcn/ui Components (Simplified - Keep as is) ---
// const Button = ({
//   children,
//   variant = "default",
//   size = "default",
//   className = "",
//   ...props
// }) => {
//   const baseStyle =
//     "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
//   const variants = {
//     default:
//       "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-500 dark:hover:bg-blue-500/90", // Added dark mode styles
//     destructive:
//       "bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-700 dark:hover:bg-red-700/90", // Added dark mode styles
//     outline:
//       "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
//     secondary:
//       "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
//     ghost:
//       "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
//     link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
//   };
//   const sizes = {
//     default: "h-10 px-4 py-2",
//     sm: "h-9 rounded-md px-3",
//     lg: "h-11 rounded-md px-8",
//     icon: "h-10 w-10",
//   };
//   return (
//     <button
//       className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };
// const Input = React.forwardRef(
//   ({ className = "", type = "text", ...props }, ref) => (
//     <input
//       type={type}
//       className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500 dark:text-gray-50 ${className}`} // Added dark mode styles
//       ref={ref}
//       {...props}
//     />
//   )
// );
// Input.displayName = "Input";
// // --- Keep other mock components (Card, Dialog, etc.) as they already use dark: variants ---
// const Card = ({ children, className = "", ...props }) => (
//   <div
//     className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const CardHeader = ({ children, className = "", ...props }) => (
//   <div
//     className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const CardTitle = ({ children, className = "", as = "h3", ...props }) => {
//   const Tag = as;
//   return (
//     <Tag
//       className={`text-lg font-semibold leading-none tracking-tight ${className}`}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };
// const CardDescription = ({ children, className = "", ...props }) => (
//   <p
//     className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
//     {...props}
//   >
//     {children}
//   </p>
// );
// const CardContent = ({ children, className = "", ...props }) => (
//   <div className={`p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const CardFooter = ({ children, className = "", ...props }) => (
//   <div className={`flex items-center p-4 md:p-6 pt-0 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const Dialog = ({ open, onClose, children }) => {
//   if (!open) return null;
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg mx-auto overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };
// const DialogContent = ({ children, className = "", ...props }) => (
//   <div className={`p-6 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const DialogHeader = ({ children, className = "", ...props }) => (
//   <div
//     className={`mb-4 border-b border-gray-200 dark:border-gray-800 pb-4 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const DialogTitle = ({ children, className = "", as = "h2", ...props }) => {
//   const Tag = as;
//   return (
//     <Tag
//       className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}
//       {...props}
//     >
//       {children}
//     </Tag>
//   );
// };
// const DialogFooter = ({ children, className = "", ...props }) => (
//   <div
//     className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 border-t border-gray-200 dark:border-gray-800 pt-4 ${className}`}
//     {...props}
//   >
//     {children}
//   </div>
// );
// const RadioGroup = ({ children, className = "", ...props }) => (
//   <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
//     {children}
//   </div>
// );
// const RadioGroupItem = ({
//   value,
//   id,
//   checked,
//   onChange,
//   className = "",
//   ...props
// }) => (
//   <input
//     type="radio"
//     id={id}
//     value={value}
//     checked={checked}
//     onChange={onChange}
//     className={`accent-blue-600 dark:accent-blue-500 ${className}`}
//     {...props}
//   />
// );
// // --- End Mock Components ---

// // --- Helper function to get greeting based on time ---
// const getGreeting = () => {
//   // ... (keep existing function)
//   const hour = new Date().getHours();
//   if (hour < 12) return "Good Morning";
//   if (hour < 18) return "Good Afternoon";
//   return "Good Evening";
// };

// // --- API Calls (fetchMotivationSuggestion, fetchChatResponse - Keep as is) ---
// async function fetchMotivationSuggestion(habits, habitLog) {
//   // ... (keep existing function)
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
//     console.error("Motivation Suggestion Error: API Key or Endpoint missing.");
//     return undefined;
//   }
//   const now = new Date();
//   const todayStr = formatDate(now);
//   const safeHabits = Array.isArray(habits) ? habits : [];
//   const safeLog = habitLog || {};
//   const todaysLog = safeLog[todayStr] || {};
//   const activeHabitsToday = safeHabits.filter((h) => {
//     try {
//       const s = parseDate(h.startDate);
//       const e = h.endDate ? parseDate(h.endDate) : null;
//       const today = parseDate(todayStr);
//       return s && today && today >= s && (!e || today <= e);
//     } catch (e) {
//       return false;
//     }
//   });
//   const completedToday = activeHabitsToday.filter(
//     (h) => todaysLog[h.id] === true
//   ).length;
//   const missedToday = activeHabitsToday.filter(
//     (h) => todaysLog[h.id] === false
//   ).length;
//   const pendingToday = activeHabitsToday.length - completedToday - missedToday;
//   let prompt = `You are a motivational assistant for a Habit Tracker app. The user is viewing their habits. `;
//   prompt += `Today (${todayStr}), out of ${activeHabitsToday.length} active habits, ${completedToday} are done, ${missedToday} are missed, and ${pendingToday} are pending. `;
//   prompt += `Current time: ${now.toLocaleTimeString()}. `;
//   if (pendingToday > 0) {
//     prompt += `Encourage the user to complete their remaining habits for today. `;
//   } else if (completedToday > 0 && activeHabitsToday.length > 0) {
//     prompt += `Congratulate the user on their progress today! `;
//   } else if (activeHabitsToday.length === 0) {
//     prompt += `There are no habits scheduled for today. Maybe plan for tomorrow? `;
//   } else {
//     prompt += `Offer some general encouragement about consistency. `;
//   }
//   prompt += `Provide a short (1-2 sentences) encouraging message based on this context, then a relevant quote on a new line prefixed with 'Quote:'.`;
//   const requestBody = {
//     contents: [{ parts: [{ text: prompt }] }],
//     generationConfig: { maxOutputTokens: 100 },
//   };
//   console.log("Sending motivation prompt:", prompt);
//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });
//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;
//       try {
//         const errorJson = await response.json();
//         errorBody = JSON.stringify(errorJson.error || errorJson);
//       } catch (e) {}
//       console.error("Gemini Motivation API Error:", errorBody);
//       throw new Error(`API request failed: ${errorBody}`);
//     }
//     const data = await response.json();
//     console.log("Received motivation data:", data);
//     const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!suggestionText) {
//       console.error("Could not parse suggestion text from response:", data);
//       return "Keep building those habits!";
//     }
//     console.log("Received motivation suggestion:", suggestionText);
//     return suggestionText.trim();
//   } catch (error) {
//     console.error("Error fetching motivation:", error);
//     if (
//       error.message.includes("API key not valid") ||
//       error.message.includes("400") ||
//       error.message.includes("403")
//     ) {
//       return "AI Suggestion Error: Invalid API Key.";
//     }
//     if (error.message.includes("Quota exceeded")) {
//       return "AI Suggestion Error: API Quota Exceeded.";
//     }
//     if (
//       error.message.includes("Failed to fetch") ||
//       error.message.includes("NetworkError")
//     ) {
//       return "AI Suggestion Error: Network issue.";
//     }
//     return "Could not get suggestion due to an error.";
//   }
// }
// async function fetchChatResponse(
//   habits,
//   habitLog,
//   chatHistory,
//   userMessage,
//   userName
// ) {
//   // ... (keep existing function, it doesn't need dark mode awareness)
//   if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT)
//     return { text: "AI features disabled." };
//   const todayStr = formatDate(new Date());
//   const safeHabits = Array.isArray(habits) ? habits : [];
//   const safeHabitLog = habitLog || {};
//   const systemInstruction = `You are ${userName}'s friendly AI assistant in their Habit Tracker app. Be concise and helpful. Use simple Markdown. Your goal is to help manage habits (both 'good' habits to build and 'bad' habits to break). You can also provide general chat/motivation. Respond ONLY with JSON for actions. **INSTRUCTIONS:** - If asked to list habits (e.g., "what are my habits?"), respond conversationally using the list provided below. Do NOT use JSON for listing. - You cannot UPDATE existing habits yet. Inform the user politely. - For non-action requests (greetings, questions), respond naturally. - For 'bad' habits, marking it 'done' means the user successfully AVOIDED the habit for that day. Marking it 'missed' means they INDULGED in the habit. **AVAILABLE HABITS:**\n${
//     safeHabits.length > 0
//       ? safeHabits
//           .map(
//             (h) =>
//               `- ${h.title} (${
//                 h.type === "bad" ? "Break Bad" : "Build Good"
//               }) (Starts: ${h.startDate}, Ends: ${h.endDate || "Ongoing"})`
//           )
//           .join("\n")
//       : "- No habits defined."
//   }\n**TODAY'S (${todayStr}) STATUS:**\n${
//     safeHabits
//       .filter((h) => {
//         const s = parseDate(h.startDate);
//         const e = h.endDate ? parseDate(h.endDate) : null;
//         const today = parseDate(todayStr);
//         return s && today && today >= s && (!e || today <= e);
//       })
//       .map((h) => {
//         const log = safeHabitLog[todayStr]?.[h.id];
//         const statusText =
//           log === true
//             ? h.type === "bad"
//               ? "Avoided"
//               : "Done"
//             : log === false
//             ? h.type === "bad"
//               ? "Indulged"
//               : "Missed"
//             : "Pending";
//         return `- ${h.title}: ${statusText}`;
//       })
//       .join("\n") || "- No habits active today."
//   }\n**ACTIONS (Respond ONLY with JSON):** - ADD HABIT: Extract title, type ('good' or 'bad'), optional start date (YYYY-MM-DD), optional end date (YYYY-MM-DD). Default start is today, default type is 'good'. JSON: {"action": "${ACTION_ADD_HABIT}", "title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null} - DELETE HABIT: Extract exact title. JSON: {"action": "${ACTION_DELETE_HABIT}", "title": "..."} (Requires confirmation) - DELETE ALL HABITS: User must explicitly ask to delete ALL. JSON: {"action": "${ACTION_DELETE_ALL_HABITS}"} (Requires confirmation) - COMPLETE HABIT FOR DATE: Extract habit title and date (YYYY-MM-DD, defaults to today if unspecified). Status is 'true' (done/avoided) or 'false' (missed/indulged). JSON: {"action": "${ACTION_COMPLETE_HABIT_DATE}", "title": "...", "date": "YYYY-MM-DD", "status": true | false} - COMPLETE ALL HABITS TODAY: Mark all habits active today as done/avoided (status: true). JSON: {"action": "${ACTION_COMPLETE_ALL_HABITS_TODAY}"} (Requires confirmation) - SUGGEST HABITS: Suggest a mix of good/bad habits if appropriate. JSON: {"action": "${ACTION_SUGGEST_HABITS}", "habits": [{"title": "...", "type": "good" | "bad", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" or null}, ...]} (Requires confirmation) Respond ONLY with the JSON structure when performing an action. No extra text.`;
//   const historyForAPI = [
//     { role: "user", parts: [{ text: systemInstruction }] },
//     {
//       role: "model",
//       parts: [{ text: `Okay, I understand. I'm ready to help with habits!` }],
//     },
//     ...chatHistory.slice(-6).map((msg) => ({
//       role: msg.sender === "user" ? "user" : "model",
//       parts: [{ text: msg.text }],
//     })),
//     { role: "user", parts: [{ text: userMessage }] },
//   ];
//   const requestBody = {
//     contents: historyForAPI,
//     generationConfig: { maxOutputTokens: 300 },
//   };
//   console.log("Sending chat request body (shortened):", {
//     contents: [
//       { role: "user", parts: [{ text: "System Instruction..." }] },
//       ...historyForAPI.slice(-2),
//     ],
//   });
//   try {
//     const response = await fetch(GEMINI_API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });
//     if (!response.ok) {
//       let errorBody = `Status: ${response.status}`;
//       try {
//         const errorJson = await response.json();
//         errorBody = JSON.stringify(errorJson.error || errorJson);
//       } catch (e) {}
//       console.error("Gemini Chat API Error:", errorBody);
//       if (response.status === 400 || response.status === 403) {
//         return { text: "Chat Error: Invalid API Key or configuration." };
//       }
//       if (response.status === 429) {
//         return {
//           text: "Chat Error: API Quota Exceeded. Please try again later.",
//         };
//       }
//       throw new Error(`API request failed: ${errorBody}`);
//     }
//     const data = await response.json();
//     console.log("Received chat data:", data);
//     const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!chatResponseText) {
//       console.error("Could not parse chat response text:", data);
//       return { text: "Sorry, I couldn't process the AI response." };
//     }
//     console.log("Received raw chat response text:", chatResponseText);
//     let actionData = null;
//     let responseText = chatResponseText.trim();
//     const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
//     const fenceMatch = responseText.match(jsonFenceRegex);
//     if (fenceMatch && fenceMatch[1]) {
//       try {
//         const extractedJson = fenceMatch[1].trim();
//         const potentialJson = JSON.parse(extractedJson);
//         if (potentialJson?.action) {
//           actionData = potentialJson;
//           console.log("Parsed action JSON from fence:", actionData);
//           responseText = "";
//         } else {
//           console.warn(
//             "Parsed content within fence doesn't look like valid action JSON:",
//             potentialJson
//           );
//         }
//       } catch (e) {
//         console.warn("Failed to parse JSON within fence, treating as text:", e);
//       }
//     } else {
//       try {
//         const potentialJson = JSON.parse(responseText);
//         if (potentialJson?.action) {
//           actionData = potentialJson;
//           console.log("Parsed action JSON directly:", actionData);
//           responseText = "";
//         } else {
//           console.log("Direct parse doesn't look like valid action JSON.");
//         }
//       } catch (e) {
//         console.log("Response is not direct JSON, treating as text.");
//       }
//     }
//     if (actionData) {
//       actionData.title = actionData.title || null;
//       actionData.habits = actionData.habits || null;
//       actionData.startDate = actionData.startDate || null;
//       actionData.endDate = actionData.endDate || null;
//       actionData.date = actionData.date || null;
//       actionData.status = actionData.status ?? null;
//       actionData.type = actionData.type || "good";
//       return actionData;
//     } else {
//       return { text: responseText, action: ACTION_GENERAL_CHAT };
//     }
//   } catch (error) {
//     console.error("Error fetching chat response:", error);
//     if (
//       error.message.includes("Failed to fetch") ||
//       error.message.includes("NetworkError")
//     ) {
//       return { text: "Chat Error: Network issue. Please check connection." };
//     }
//     return { text: `Sorry, an error occurred while contacting the AI.` };
//   }
// }
// // --- Main App Component ---
// function App() {
//   // --- NEW: Use the dark mode hook ---
//   const [isDarkMode, toggleDarkMode] = useDarkMode();

//   // --- State Definitions (Keep existing) ---
//   const [habits, setHabits] = useState([]);
//   const [habitLog, setHabitLog] = useState({});
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
//   const [editingHabit, setEditingHabit] = useState(null);
//   const [newHabitTitle, setNewHabitTitle] = useState("");
//   const [newHabitType, setNewHabitType] = useState("good");
//   const [newHabitStartDate, setNewHabitStartDate] = useState(
//     formatDate(new Date())
//   );
//   const [newHabitEndDate, setNewHabitEndDate] = useState("");
//   const [currentDate] = useState(new Date());
//   const [aiSuggestion, setAiSuggestion] = useState(
//     GEMINI_API_KEY ? "Loading suggestion..." : "AI features disabled."
//   );
//   const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isChatLoading, setIsChatLoading] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const chatMessagesEndRef = useRef(null);
//   const chatInputRef = useRef(null);
//   const [pendingActionData, setPendingActionData] = useState(null);
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
//   const [userName, setUserName] = useState("User");
//   const recognitionRef = useRef(null);
//   const [isListening, setIsListening] = useState(false);

//   // --- Effects (Keep existing for localStorage, AI suggestion, chat scroll) ---
//   // Load data effect
//   useEffect(() => {
//     console.log("App Mounted: Loading data.");
//     let loadedHabits = [];
//     let loadedLog = {};
//     let loadedName = "User";
//     try {
//       const storedHabits = localStorage.getItem("dayPlannerHabits");
//       if (storedHabits) {
//         try {
//           const parsed = JSON.parse(storedHabits);
//           if (Array.isArray(parsed)) {
//             loadedHabits = parsed;
//             console.log(`Loaded ${loadedHabits.length} habits.`);
//           } else {
//             console.warn("Stored habits data is not an array.");
//           }
//         } catch (e) {
//           console.error("Failed to parse stored habits:", e);
//           localStorage.removeItem("dayPlannerHabits");
//         }
//       }
//     } catch (e) {
//       console.error("Error accessing habits from localStorage:", e);
//     }
//     try {
//       const storedHabitLog = localStorage.getItem("dayPlannerHabitLog");
//       if (storedHabitLog) {
//         try {
//           const parsed = JSON.parse(storedHabitLog);
//           if (typeof parsed === "object" && parsed !== null) {
//             loadedLog = parsed;
//             console.log(
//               `Loaded habit log for ${Object.keys(loadedLog).length} dates.`
//             );
//           } else {
//             console.warn("Stored habit log data is not an object.");
//           }
//         } catch (e) {
//           console.error("Failed to parse stored habit log:", e);
//           localStorage.removeItem("dayPlannerHabitLog");
//         }
//       }
//     } catch (e) {
//       console.error("Error accessing habit log from localStorage:", e);
//     }
//     try {
//       const storedName = localStorage.getItem("dayPlannerUserName");
//       if (storedName) {
//         loadedName = storedName;
//         console.log("Loaded name:", loadedName);
//       }
//     } catch (e) {
//       console.error("Error accessing username from localStorage:", e);
//     }
//     setHabits(loadedHabits);
//     setHabitLog(loadedLog);
//     setUserName(loadedName);
//     console.log("Initial data loading complete.");
//   }, []);
//   // Save data effects
//   useEffect(() => {
//     try {
//       if (habits.length > 0 || localStorage.getItem("dayPlannerHabits"))
//         localStorage.setItem("dayPlannerHabits", JSON.stringify(habits));
//     } catch (e) {
//       console.error("Save Habit Error:", e);
//     }
//   }, [habits]);
//   useEffect(() => {
//     try {
//       if (
//         Object.keys(habitLog).length > 0 ||
//         localStorage.getItem("dayPlannerHabitLog")
//       )
//         localStorage.setItem("dayPlannerHabitLog", JSON.stringify(habitLog));
//     } catch (e) {
//       console.error("Save Log Error:", e);
//     }
//   }, [habitLog]);
//   useEffect(() => {
//     if (userName !== "User")
//       try {
//         localStorage.setItem("dayPlannerUserName", userName);
//       } catch (e) {
//         console.error("Save Name Error:", e);
//       }
//   }, [userName]);
//   // Fetch AI Suggestion effect
//   useEffect(() => {
//     if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
//       setAiSuggestion("AI features disabled.");
//       setIsLoadingSuggestion(false);
//       return;
//     }
//     console.log(`App loaded, fetching initial motivation.`);
//     setIsLoadingSuggestion(true);
//     setAiSuggestion("Getting suggestion...");
//     const timer = setTimeout(() => {
//       fetchMotivationSuggestion(habits, habitLog)
//         .then((suggestion) => {
//           setAiSuggestion(suggestion || "Could not get suggestion.");
//         })
//         .catch((error) => {
//           console.error("Motivation fetch error in useEffect:", error);
//           setAiSuggestion("Failed to get suggestion.");
//         })
//         .finally(() => {
//           setIsLoadingSuggestion(false);
//         });
//     }, 100);
//     return () => clearTimeout(timer);
//   }, []); // <-- NOTE: Removed habits & habitLog dependency to fetch ONLY ONCE
//   // Scroll chat effect
//   useEffect(() => {
//     if (isChatOpen && chatHistory.length > 0) {
//       setTimeout(() => {
//         chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     }
//   }, [chatHistory, isChatOpen]);

//   // --- Habit Management Callbacks (Keep existing) ---
//   const closeHabitModal = useCallback(() => {
//     console.log("Closing habit modal");
//     setIsHabitModalOpen(false);
//     setEditingHabit(null);
//     setNewHabitTitle("");
//     setNewHabitType("good");
//     setNewHabitStartDate(formatDate(new Date()));
//     setNewHabitEndDate("");
//   }, []);
//   const upsertHabit = useCallback(
//     (habitData) => {
//       try {
//         console.log("Upserting habit:", habitData);
//         const newHabit = {
//           id:
//             habitData.id ||
//             `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
//           title: (habitData.title || "").trim(),
//           type: habitData.type === "bad" ? "bad" : "good",
//           startDate: habitData.startDate || formatDate(new Date()),
//           endDate: habitData.endDate || null,
//         };
//         if (!newHabit.title) {
//           console.warn("Attempted to add habit without title.");
//           return;
//         }
//         if (newHabit.endDate && newHabit.startDate > newHabit.endDate) {
//           alert("Habit end date cannot be before the start date.");
//           return;
//         }
//         setHabits((prev) => {
//           const safePrev = Array.isArray(prev) ? prev : [];
//           const existingIndex = safePrev.findIndex((h) => h.id === newHabit.id);
//           let updatedHabits = [...safePrev];
//           if (existingIndex > -1) {
//             updatedHabits[existingIndex] = newHabit;
//           } else {
//             updatedHabits.push(newHabit);
//           }
//           updatedHabits.sort((a, b) => a.title.localeCompare(b.title));
//           console.log("Habits state updated:", updatedHabits.length);
//           return updatedHabits;
//         });
//       } catch (e) {
//         console.error("Upsert Habit Error:", e);
//       }
//     },
//     [setHabits]
//   );
//   const handleHabitModalSave = useCallback(() => {
//     console.log("Handling habit modal save");
//     if (!newHabitTitle.trim()) {
//       alert("Habit title required.");
//       return;
//     }
//     upsertHabit({
//       id: editingHabit?.id,
//       title: newHabitTitle,
//       type: newHabitType,
//       startDate: newHabitStartDate,
//       endDate: newHabitEndDate,
//     });
//     closeHabitModal();
//   }, [
//     upsertHabit,
//     editingHabit,
//     newHabitTitle,
//     newHabitType,
//     newHabitStartDate,
//     newHabitEndDate,
//     closeHabitModal,
//   ]);
//   const findHabitIdByTitle = useCallback(
//     (title) => {
//       if (!title || !Array.isArray(habits)) return null;
//       const searchTerm = title.trim().toLowerCase();
//       if (!searchTerm) return null;
//       const exactMatch = habits.find(
//         (h) => h.title.trim().toLowerCase() === searchTerm
//       );
//       if (exactMatch) {
//         console.log(`Found exact habit match: ${exactMatch.id}`);
//         return exactMatch.id;
//       }
//       const partialMatches = habits.filter((h) =>
//         h.title.trim().toLowerCase().includes(searchTerm)
//       );
//       if (partialMatches.length === 1) {
//         console.log(`Found partial habit match: ${partialMatches[0].id}`);
//         return partialMatches[0].id;
//       }
//       if (partialMatches.length > 1) {
//         console.warn(`Ambiguous habit title: ${title}`);
//         return null;
//       }
//       console.log(`Habit not found: ${title}`);
//       return null;
//     },
//     [habits]
//   );
//   const handleDeleteHabitCallback = useCallback(
//     (id) => {
//       try {
//         if (!id) return;
//         console.log("Deleting habit:", id);
//         setHabits((prev) =>
//           (Array.isArray(prev) ? prev : []).filter((h) => h.id !== id)
//         );
//         setHabitLog((prevLog) => {
//           const newLog = { ...(prevLog || {}) };
//           Object.keys(newLog).forEach((date) => {
//             if (newLog[date]?.[id] !== undefined) {
//               delete newLog[date][id];
//               if (Object.keys(newLog[date]).length === 0) delete newLog[date];
//             }
//           });
//           console.log(
//             "Habit log updated after delete:",
//             Object.keys(newLog).length
//           );
//           return newLog;
//         });
//       } catch (e) {
//         console.error("Delete Habit Error:", e);
//       }
//     },
//     [setHabits, setHabitLog]
//   );
//   const openModalForEditHabit = useCallback((habit) => {
//     console.log("Opening habit modal for edit:", habit);
//     setEditingHabit(habit);
//     setNewHabitTitle(habit.title);
//     setNewHabitType(habit.type || "good");
//     setNewHabitStartDate(habit.startDate);
//     setNewHabitEndDate(habit.endDate || "");
//     setIsHabitModalOpen(true);
//   }, []);
//   const openModalForNewHabit = useCallback(() => {
//     console.log("Opening habit modal for new");
//     setEditingHabit(null);
//     setNewHabitTitle("");
//     setNewHabitType("good");
//     setNewHabitStartDate(formatDate(new Date()));
//     setNewHabitEndDate("");
//     setIsHabitModalOpen(true);
//   }, []);
//   const setHabitCompletionStatus = useCallback(
//     (habitId, date, desiredStatus) => {
//       try {
//         const dateStr = formatDate(date);
//         if (!dateStr || !habitId) return;
//         console.log(
//           `Setting habit ${habitId} for ${dateStr} to ${desiredStatus}`
//         );
//         setHabitLog((prevLog) => {
//           const safePrevLog = prevLog || {};
//           const dayLog = { ...(safePrevLog[dateStr] || {}) };
//           const currentStatus = dayLog[habitId];
//           if (currentStatus === desiredStatus) delete dayLog[habitId];
//           else dayLog[habitId] = desiredStatus;
//           const newLog = { ...safePrevLog };
//           if (Object.keys(dayLog).length === 0) delete newLog[dateStr];
//           else newLog[dateStr] = dayLog;
//           console.log("Habit log updated:", Object.keys(newLog).length);
//           return newLog;
//         });
//       } catch (e) {
//         console.error("Set Habit Status Error:", e);
//       }
//     },
//     [setHabitLog]
//   );

//   // --- Chat Handling (Keep existing - already handles errors/confirmations) ---
//   const handleSendChatMessage = useCallback(async () => {
//     const messageText = chatInput.trim();
//     console.log(
//       `handleSendChatMessage called. Message: "${messageText}", Awaiting: ${awaitingConfirmation}`
//     );
//     if (!messageText && !awaitingConfirmation) return;
//     if (isChatLoading) {
//       console.log("Chat is already loading.");
//       return;
//     }
//     const newUserMessage = { sender: "user", text: messageText };
//     if (awaitingConfirmation && pendingActionData) {
//       console.log("Processing confirmation...");
//       try {
//         setChatHistory((prev) => [...prev, newUserMessage]);
//         setChatInput("");
//         const userConfirmation = messageText.toLowerCase();
//         let confirmationResponseText = "";
//         let performAction = false;
//         if (userConfirmation === "yes" || userConfirmation === "y")
//           performAction = true;
//         else if (userConfirmation === "no" || userConfirmation === "n")
//           confirmationResponseText = "Okay, action cancelled.";
//         else {
//           confirmationResponseText = `Please confirm with 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;
//         }
//         if (performAction) {
//           try {
//             console.log(
//               "Performing confirmed action:",
//               pendingActionData.action
//             );
//             switch (pendingActionData.action) {
//               case ACTION_DELETE_HABIT:
//                 pendingActionData.habitIds?.forEach((id) =>
//                   handleDeleteHabitCallback(id)
//                 );
//                 confirmationResponseText = `Okay, deleted habit(s).`;
//                 break;
//               case ACTION_SUGGEST_HABITS:
//                 pendingActionData.habits?.forEach((h) => upsertHabit(h));
//                 confirmationResponseText = `Okay, added suggested habit(s).`;
//                 break;
//               case ACTION_DELETE_ALL_HABITS:
//                 console.log("Deleting all habits confirmed.");
//                 setHabits([]);
//                 setHabitLog({});
//                 confirmationResponseText = "Okay, deleted all habits.";
//                 break;
//               case ACTION_COMPLETE_ALL_HABITS_TODAY:
//                 console.log("Completing all habits for today confirmed.");
//                 const todayStr = formatDate(new Date());
//                 const activeHabitsToday = (
//                   Array.isArray(habits) ? habits : []
//                 ).filter((h) => {
//                   if (!h || !h.startDate) return false;
//                   try {
//                     const s = parseDate(h.startDate);
//                     const e = h.endDate ? parseDate(h.endDate) : null;
//                     const today = parseDate(todayStr);
//                     if (!s || !today) return false;
//                     if (h.endDate && !e) return false;
//                     return today >= s && (!e || today <= e);
//                   } catch (filterError) {
//                     console.error(
//                       "Error filtering habit in COMPLETE_ALL:",
//                       h,
//                       filterError
//                     );
//                     return false;
//                   }
//                 });
//                 const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
//                   ? activeHabitsToday
//                       .map((h) => h && h.id)
//                       .filter((id) => id != null)
//                   : [];
//                 if (!Array.isArray(activeHabitsTodayIds)) {
//                   console.error(
//                     "Error: activeHabitsTodayIds is not an array in COMPLETE_ALL action."
//                   );
//                   confirmationResponseText = "Error processing active habits.";
//                 } else if (activeHabitsTodayIds.length > 0) {
//                   activeHabitsTodayIds.forEach((id) =>
//                     setHabitCompletionStatus(id, new Date(), true)
//                   );
//                   confirmationResponseText = `Okay, marked all ${activeHabitsTodayIds.length} active habits for today as complete/avoided.`;
//                 } else {
//                   confirmationResponseText =
//                     "No habits were active today to mark as complete.";
//                 }
//                 break;
//               default:
//                 confirmationResponseText = "Action confirmed (unknown type).";
//                 console.warn(
//                   "Confirmed unknown action type:",
//                   pendingActionData.action
//                 );
//             }
//           } catch (error) {
//             console.error("Error performing confirmed action:", error);
//             confirmationResponseText =
//               "Sorry, there was an error performing the action.";
//           }
//         }
//         if (confirmationResponseText) {
//           setChatHistory((prev) => [
//             ...prev,
//             { sender: "bot", text: confirmationResponseText },
//           ]);
//         }
//         if (
//           performAction ||
//           userConfirmation === "no" ||
//           userConfirmation === "n"
//         ) {
//           setPendingActionData(null);
//           setAwaitingConfirmation(false);
//         }
//       } catch (error) {
//         console.error("Error during confirmation flow:", error);
//         setChatHistory((prev) => [
//           ...prev,
//           { sender: "bot", text: "An error occurred during confirmation." },
//         ]);
//         setPendingActionData(null);
//         setAwaitingConfirmation(false);
//       } finally {
//         setTimeout(() => chatInputRef.current?.focus(), 0);
//       }
//       return;
//     }
//     console.log("Processing new chat message...");
//     setIsChatLoading(true);
//     setChatHistory((prev) => [...prev, newUserMessage]);
//     setChatInput("");
//     try {
//       const currentChatHistory = [...chatHistory, newUserMessage];
//       console.log("Calling fetchChatResponse...");
//       const botResponse = await fetchChatResponse(
//         habits,
//         habitLog,
//         currentChatHistory,
//         messageText,
//         userName
//       );
//       console.log("Received bot response object:", botResponse);
//       let requiresConfirmation = false;
//       let confirmationPrompt = "";
//       let chatMessageToAdd = "";
//       let actionDataForConfirmation = null;
//       if (!botResponse || (!botResponse.action && !botResponse.text)) {
//         throw new Error("Invalid or empty bot response received.");
//       }
//       if (botResponse.action && botResponse.action !== ACTION_GENERAL_CHAT) {
//         console.log(`AI detected action: ${botResponse.action}`);
//         actionDataForConfirmation = {
//           action: botResponse.action,
//           confirmationPrompt: "",
//         };
//         try {
//           switch (botResponse.action) {
//             case ACTION_ADD_HABIT:
//               upsertHabit({
//                 title: botResponse.title,
//                 type: botResponse.type,
//                 startDate: botResponse.startDate,
//                 endDate: botResponse.endDate,
//               });
//               chatMessageToAdd = `Okay, added habit "${botResponse.title}".`;
//               break;
//             case ACTION_DELETE_HABIT:
//               const habitIdToDelete = findHabitIdByTitle(botResponse.title);
//               if (habitIdToDelete) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Delete habit "${botResponse.title}" and all its logs? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   habitIds: [habitIdToDelete],
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = `Couldn't find habit "${botResponse.title}".`;
//               }
//               break;
//             case ACTION_COMPLETE_HABIT_DATE:
//               const habitIdToLog = findHabitIdByTitle(botResponse.title);
//               const dateToLog = botResponse.date || formatDate(new Date());
//               const statusToLog = botResponse.status;
//               const parsedDate = parseDate(dateToLog);
//               if (habitIdToLog && parsedDate && statusToLog !== null) {
//                 setHabitCompletionStatus(habitIdToLog, parsedDate, statusToLog);
//                 chatMessageToAdd = `Okay, marked habit "${
//                   botResponse.title
//                 }" as ${
//                   statusToLog ? "done/avoided" : "missed/indulged"
//                 } for ${dateToLog}.`;
//               } else {
//                 chatMessageToAdd = `Couldn't log habit "${botResponse.title}" for ${dateToLog}. Check title/date format (YYYY-MM-DD).`;
//               }
//               break;
//             case ACTION_SUGGEST_HABITS:
//               if (botResponse.habits?.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `AI suggests adding habits: ${botResponse.habits
//                   .map((h) => `"${h.title}"`)
//                   .join(", ")}. Add them? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   habits: botResponse.habits,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "AI couldn't suggest habits.";
//               }
//               break;
//             case ACTION_DELETE_ALL_HABITS:
//               if (habits.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Are you sure you want to delete all ${habits.length} habits and their logs? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "You don't have any habits to delete.";
//               }
//               break;
//             case ACTION_COMPLETE_ALL_HABITS_TODAY:
//               const todayStr = formatDate(new Date());
//               const activeHabitsToday = (
//                 Array.isArray(habits) ? habits : []
//               ).filter((h) => {
//                 if (!h || !h.startDate) return false;
//                 try {
//                   const s = parseDate(h.startDate);
//                   const e = h.endDate ? parseDate(h.endDate) : null;
//                   const today = parseDate(todayStr);
//                   if (!s || !today) return false;
//                   if (h.endDate && !e) return false;
//                   return today >= s && (!e || today <= e);
//                 } catch (filterError) {
//                   console.error(
//                     "Error filtering habit in COMPLETE_ALL:",
//                     h,
//                     filterError
//                   );
//                   return false;
//                 }
//               });
//               const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
//                 ? activeHabitsToday
//                     .map((h) => h && h.id)
//                     .filter((id) => id != null)
//                 : [];
//               if (!Array.isArray(activeHabitsTodayIds)) {
//                 console.error(
//                   "Error: activeHabitsTodayIds is not an array in COMPLETE_ALL action check."
//                 );
//                 chatMessageToAdd = "Error calculating active habits.";
//               } else if (activeHabitsTodayIds.length > 0) {
//                 requiresConfirmation = true;
//                 confirmationPrompt = `Mark all ${activeHabitsTodayIds.length} active habits for today as done/avoided? (yes/no)`;
//                 actionDataForConfirmation = {
//                   ...actionDataForConfirmation,
//                   confirmationPrompt,
//                 };
//               } else {
//                 chatMessageToAdd = "No habits are active today.";
//               }
//               break;
//             default:
//               chatMessageToAdd = "Sorry, I received an unknown habit action.";
//               console.warn("Unknown action:", botResponse.action);
//           }
//         } catch (actionError) {
//           console.error(
//             `Error processing action ${botResponse.action}:`,
//             actionError
//           );
//           chatMessageToAdd = `Sorry, error processing action: ${botResponse.action}.`;
//           requiresConfirmation = false;
//         }
//         if (
//           requiresConfirmation &&
//           actionDataForConfirmation?.confirmationPrompt
//         ) {
//           setPendingActionData(actionDataForConfirmation);
//           setAwaitingConfirmation(true);
//           chatMessageToAdd = confirmationPrompt;
//           console.log("Set state for confirmation:", actionDataForConfirmation);
//         }
//       } else {
//         chatMessageToAdd =
//           botResponse.text || "Sorry, I didn't understand that.";
//         console.log("Handling general chat response.");
//         const lowerCaseMsg = messageText.toLowerCase();
//         if (
//           lowerCaseMsg.startsWith("my name is ") ||
//           lowerCaseMsg.startsWith("i'm ") ||
//           lowerCaseMsg.startsWith("im ")
//         ) {
//           const potentialName = messageText
//             .substring(messageText.lastIndexOf(" ") + 1)
//             .replace(/[^a-zA-Z]/g, "");
//           if (potentialName?.length > 1) {
//             const name =
//               potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
//             setUserName(name);
//             console.log(`Potential name detected and set: ${name}`);
//             chatMessageToAdd = `Nice to meet you, ${name}! How can I help with your habits?`;
//           }
//         }
//       }
//       if (chatMessageToAdd) {
//         console.log("Adding bot message to chat:", chatMessageToAdd);
//         setChatHistory((prev) => [
//           ...prev,
//           { sender: "bot", text: chatMessageToAdd },
//         ]);
//       } else if (!requiresConfirmation) {
//         console.warn("No chat message generated:", botResponse);
//       }
//     } catch (error) {
//       console.error("Critical Error in handleSendChatMessage:", error);
//       try {
//         setChatHistory((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: "A critical error occurred. Please check the console.",
//           },
//         ]);
//       } catch (e) {}
//     } finally {
//       setIsChatLoading(false);
//       if (!awaitingConfirmation) {
//         try {
//           setTimeout(() => chatInputRef.current?.focus(), 0);
//         } catch (e) {}
//       }
//       console.log("handleSendChatMessage finished.");
//     }
//   }, [
//     chatInput,
//     chatHistory,
//     habits,
//     habitLog,
//     isChatLoading,
//     upsertHabit,
//     findHabitIdByTitle,
//     handleDeleteHabitCallback,
//     setHabitCompletionStatus,
//     awaitingConfirmation,
//     pendingActionData,
//     userName,
//     setUserName,
//     setHabits,
//     setHabitLog,
//   ]);
//   const handleChatInputKeyPress = (event) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault();
//       handleSendChatMessage();
//     }
//   };
//   const toggleChat = useCallback(() => {
//     console.log("Toggling chat visibility");
//     setIsChatOpen((prev) => !prev);
//   }, []);

//   // --- Voice Input Logic (Keep existing) ---
//   const setupSpeechRecognition = useCallback(() => {
//     const SpeechRecognitionAPI =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognitionAPI) {
//       console.warn("Speech Recognition API not supported.");
//       return;
//     }
//     const recognition = new SpeechRecognitionAPI();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";
//     recognition.onstart = () => {
//       setIsListening(true);
//       console.log("Voice started.");
//       setChatInput("Listening...");
//     };
//     recognition.onresult = (event) => {
//       const transcript =
//         event.results[event.results.length - 1][0].transcript.trim();
//       console.log("Voice transcript:", transcript);
//       setChatInput(transcript);
//     };
//     recognition.onerror = (event) => {
//       console.error("Speech error:", event.error);
//       let errorMsg = `Speech error: ${event.error}`;
//       if (event.error === "not-allowed") {
//         errorMsg = "Mic permission denied.";
//       } else if (event.error === "no-speech") {
//         errorMsg = "No speech detected.";
//       }
//       setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
//       setIsListening(false);
//     };
//     recognition.onend = () => {
//       console.log("Voice ended.");
//       setIsListening(false);
//       chatInputRef.current?.focus();
//     };
//     recognitionRef.current = recognition;
//   }, [setChatHistory, setChatInput]);
//   useEffect(() => {
//     setupSpeechRecognition();
//     return () => {
//       recognitionRef.current?.abort();
//     };
//   }, [setupSpeechRecognition]);
//   const handleMicClick = () => {
//     if (!recognitionRef.current) {
//       console.warn("Speech recognition not initialized.");
//       return;
//     }
//     if (isListening) {
//       recognitionRef.current.stop();
//     } else {
//       navigator.mediaDevices
//         .getUserMedia({ audio: true })
//         .then(() => {
//           setChatInput("");
//           recognitionRef.current.start();
//         })
//         .catch((err) => {
//           console.error("Mic access denied:", err);
//           setChatHistory((prev) => [
//             ...prev,
//             { sender: "bot", text: "Mic access denied." },
//           ]);
//         });
//     }
//   };

//   // --- Memoized Values (Keep existing) ---
//   const activeHabitsForSelectedDate = useMemo(() => {
//     try {
//       const selectedD = parseDate(formatDate(selectedDate));
//       if (!selectedD || !Array.isArray(habits)) return [];
//       return habits.filter((h) => {
//         const startD = parseDate(h.startDate);
//         const endD = h.endDate ? parseDate(h.endDate) : null;
//         if (!startD) return false;
//         return selectedD >= startD && (!endD || selectedD <= endD);
//       });
//     } catch (error) {
//       console.error("Error calculating active habits:", error);
//       return [];
//     }
//   }, [habits, selectedDate]);

//   // --- Calendar Tile Styling (Keep existing) ---
//   const getTileClassName = ({ date, view: calendarView }) => {
//     try {
//       if (calendarView !== "month") return null;
//       const dateStr = formatDate(date);
//       if (!dateStr) return null;
//       const logForDay = habitLog?.[dateStr];
//       const safeHabits = Array.isArray(habits) ? habits : [];
//       const habitsForDay = safeHabits.filter((h) => {
//         const s = parseDate(h.startDate);
//         const e = h.endDate ? parseDate(h.endDate) : null;
//         const c = parseDate(dateStr);
//         return s && c && c >= s && (!e || c <= e);
//       });
//       if (habitsForDay.length === 0) return null;
//       const completedCount = habitsForDay.filter(
//         (h) => logForDay?.[h.id] === true
//       ).length;
//       const missedCount = habitsForDay.filter(
//         (h) => logForDay?.[h.id] === false
//       ).length;
//       const loggedCount = completedCount + missedCount;
//       if (completedCount === habitsForDay.length)
//         return "habit-day-all-complete";
//       if (loggedCount === habitsForDay.length && loggedCount > 0)
//         return "habit-day-all-missed";
//       if (loggedCount > 0) return "habit-day-partial-log";
//       return null;
//     } catch (error) {
//       console.error("Error in getTileClassName:", error);
//       return null;
//     }
//   };
//   // --- Render JSX ---
//   return (
//     // The root div uses dark: variants which will be activated by the 'dark' class on <html>
//     <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
//       {/* Header */}
//       <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//         <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
//           <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
//             Habit Tracker
//           </h1>
//           <div className="flex items-center gap-4">
//             {" "}
//             {/* NEW: Flex container for greeting and button */}
//             <div className="text-right hidden sm:block">
//               <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                 {getGreeting()}, {userName}!
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 {currentDate.toLocaleDateString(undefined, {
//                   weekday: "long",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </p>
//             </div>
//             {/* --- NEW: Dark Mode Toggle Button --- */}
//             <Button
//               onClick={toggleDarkMode}
//               variant="ghost"
//               size="icon"
//               className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 h-9 w-9"
//               aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
//             >
//               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </Button>
//             {/* --- End Dark Mode Toggle Button --- */}
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden relative">
//         {/* Left Column: Calendar & Daily Log */}
//         {/* ... Keep existing JSX ... */}
//         <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//           {/* Calendar Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <CalendarIcon
//                   size={20}
//                   className="text-purple-600 dark:text-purple-400"
//                 />
//                 Habit Calendar
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="flex justify-center">
//               <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
//                 <Calendar
//                   onChange={setSelectedDate}
//                   value={selectedDate}
//                   tileClassName={getTileClassName}
//                   maxDate={new Date()}
//                   className="text-sm" // Tailwind/dark mode handled by CSS/JS
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           {/* Daily Habit Log Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90">
//             <CardHeader>
//               <CardTitle className="text-lg">
//                 {" "}
//                 Log for {formatDate(selectedDate)}{" "}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {activeHabitsForSelectedDate.length > 0 ? (
//                 <ul className="space-y-3">
//                   {activeHabitsForSelectedDate.map((habit) => {
//                     const logStatus =
//                       habitLog[formatDate(selectedDate)]?.[habit.id];
//                     return (
//                       <li
//                         key={habit.id}
//                         className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
//                       >
//                         <span className="font-medium text-sm md:text-base">
//                           {" "}
//                           {habit.title}{" "}
//                         </span>
//                         <div className="flex items-center space-x-2 flex-shrink-0">
//                           <Button
//                             variant={logStatus === true ? "default" : "outline"}
//                             size="sm"
//                             onClick={() =>
//                               setHabitCompletionStatus(
//                                 habit.id,
//                                 selectedDate,
//                                 true
//                               )
//                             }
//                             className={`w-20 ${
//                               logStatus === true
//                                 ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800"
//                                 : "dark:text-gray-200 dark:border-gray-600"
//                             }`}
//                             aria-label={`Mark ${habit.title} as done`}
//                           >
//                             {" "}
//                             <CheckCircle size={16} className="mr-1" /> Done{" "}
//                           </Button>
//                           <Button
//                             variant={
//                               logStatus === false ? "destructive" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setHabitCompletionStatus(
//                                 habit.id,
//                                 selectedDate,
//                                 false
//                               )
//                             }
//                             className={`w-20 ${
//                               logStatus === false
//                                 ? "bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800"
//                                 : "dark:text-gray-200 dark:border-gray-600"
//                             }`}
//                             aria-label={`Mark ${habit.title} as missed`}
//                           >
//                             {" "}
//                             <XCircle size={16} className="mr-1" /> Missed{" "}
//                           </Button>
//                         </div>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : (
//                 <p className="text-center text-gray-500 dark:text-gray-400 py-4">
//                   {" "}
//                   No habits scheduled for this date.{" "}
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column: Habit Management & AI Suggestion */}
//         {/* ... Keep existing JSX ... */}
//         <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col overflow-hidden">
//           {/* Habit AI Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 {" "}
//                 <Brain size={20} className="text-blue-500" /> Habit Assistant{" "}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-start gap-2 shadow-sm border border-blue-200 dark:border-blue-800 flex-1 min-w-0">
//               <Brain
//                 size={20}
//                 className={`flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 ${
//                   isLoadingSuggestion ? "animate-pulse" : ""
//                 }`}
//               />
//               <span className="italic whitespace-pre-line text-xs sm:text-sm">
//                 {" "}
//                 {isLoadingSuggestion
//                   ? "Getting suggestion..."
//                   : aiSuggestion}{" "}
//               </span>
//             </CardContent>
//             <CardFooter>
//               <Button
//                 onClick={openModalForNewHabit}
//                 className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
//               >
//                 {" "}
//                 <Plus size={18} className="mr-2" /> Add New Habit{" "}
//               </Button>
//             </CardFooter>
//           </Card>
//           {/* Habit List Card */}
//           <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col flex-grow overflow-hidden">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 {" "}
//                 <Settings
//                   size={20}
//                   className="text-gray-600 dark:text-gray-400"
//                 />{" "}
//                 Manage Habits{" "}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//               {habits.length > 0 ? (
//                 <ul className="space-y-2">
//                   {habits.map((habit) => (
//                     <li
//                       key={habit.id}
//                       className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 group"
//                     >
//                       <div className="flex items-center space-x-2 text-sm">
//                         {habit.type === "bad" ? (
//                           <ThumbsDown
//                             size={16}
//                             className="text-red-500 flex-shrink-0"
//                           />
//                         ) : (
//                           <ThumbsUp
//                             size={16}
//                             className="text-green-500 flex-shrink-0"
//                           />
//                         )}
//                         <div>
//                           <span className="font-medium block">
//                             {" "}
//                             {habit.title}{" "}
//                           </span>
//                           <span className="text-xs text-gray-500 dark:text-gray-400">
//                             {" "}
//                             {habit.startDate} to {habit.endDate || "Ongoing"}{" "}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 h-7 w-7"
//                           onClick={() => openModalForEditHabit(habit)}
//                           aria-label={`Edit habit ${habit.title}`}
//                         >
//                           {" "}
//                           <Edit size={14} />{" "}
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 h-7 w-7"
//                           onClick={() => handleDeleteHabitCallback(habit.id)}
//                           aria-label={`Delete habit ${habit.title}`}
//                         >
//                           {" "}
//                           <Trash2 size={14} />{" "}
//                         </Button>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 flex flex-col items-center gap-2">
//                   {" "}
//                   <Info size={24} /> <span>No habits defined yet.</span>{" "}
//                   <span>Click "Add New Habit" or ask the AI!</span>{" "}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Floating Action Button for Chat */}
//         {/* ... Keep existing JSX ... */}
//         {!isChatOpen && (
//           <Button
//             onClick={toggleChat}
//             variant="default"
//             size="icon"
//             className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition-transform hover:scale-110"
//             aria-label="Open Chat Assistant"
//           >
//             {" "}
//             <MessageSquare size={24} />{" "}
//           </Button>
//         )}
//       </main>

//       {/* Chat Window (Drawer) */}
//       {/* ... Keep existing JSX ... */}
//       {isChatOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//             onClick={toggleChat}
//             aria-hidden="true"
//           ></div>
//           <div
//             className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white dark:bg-gray-900 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
//               isChatOpen ? "translate-x-0" : "translate-x-full"
//             }`}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="chat-title"
//           >
//             <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
//               <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between p-4">
//                 <CardTitle
//                   id="chat-title"
//                   className="flex items-center gap-2 text-lg"
//                 >
//                   {" "}
//                   <MessageSquare
//                     size={20}
//                     className="text-indigo-600 dark:text-indigo-400"
//                   />{" "}
//                   Habit Assistant{" "}
//                 </CardTitle>
//                 <Button
//                   onClick={toggleChat}
//                   variant="ghost"
//                   size="icon"
//                   aria-label="Close Chat"
//                 >
//                   {" "}
//                   <X size={20} />{" "}
//                 </Button>
//               </CardHeader>
//               <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                 {chatHistory.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`flex items-start gap-2.5 ${
//                       msg.sender === "user" ? "justify-end" : ""
//                     }`}
//                   >
//                     {msg.sender === "bot" && (
//                       <Bot
//                         size={24}
//                         className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900"
//                       />
//                     )}
//                     <div
//                       className={`p-2.5 rounded-lg max-w-[85%] shadow-sm ${
//                         // This outer div styles the message bubble
//                         msg.sender === "user"
//                           ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
//                           : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                       }`}
//                     >
//                       {/* Add a new div wrapper for prose styling */}
//                       <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
//                         <ReactMarkdown
//                           // No className prop here anymore
//                           components={{
//                             a: ({ node, ...props }) => (
//                               <a
//                                 {...props}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 dark:text-blue-400 hover:underline" // Styling links via components is still fine
//                               />
//                             ),
//                             // You can add more component overrides here if needed for specific tags (p, ul, etc.)
//                           }}
//                         >
//                           {msg.text || ""}
//                         </ReactMarkdown>
//                       </div>{" "}
//                       {/* End of the new wrapper div */}
//                     </div>
//                     {msg.sender === "user" && (
//                       <User
//                         size={24}
//                         className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-blue-100 dark:bg-blue-900"
//                       />
//                     )}
//                   </div>
//                 ))}
//                 {isChatLoading && (
//                   <div className="flex items-start gap-2.5">
//                     {" "}
//                     <Bot
//                       size={24}
//                       className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse"
//                     />{" "}
//                     <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic">
//                       {" "}
//                       Assistant is thinking...{" "}
//                     </div>{" "}
//                   </div>
//                 )}
//                 <div ref={chatMessagesEndRef} />
//               </CardContent>
//               <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4 bg-white dark:bg-gray-900 flex-shrink-0">
//                 <div className="flex w-full items-center space-x-2">
//                   <Input
//                     ref={chatInputRef}
//                     type="text"
//                     placeholder={
//                       isListening
//                         ? "Listening..."
//                         : awaitingConfirmation
//                         ? "Confirm (yes/no)..."
//                         : `Ask about habits...`
//                     }
//                     className="flex-1"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     onKeyPress={handleChatInputKeyPress}
//                     disabled={isChatLoading && !awaitingConfirmation}
//                     aria-label="Chat input"
//                   />
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={handleMicClick}
//                     disabled={isChatLoading}
//                     className={`text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${
//                       isListening ? "text-red-500 animate-pulse" : ""
//                     }`}
//                     title={isListening ? "Stop Listening" : "Start Listening"}
//                     aria-label={
//                       isListening ? "Stop listening" : "Start voice input"
//                     }
//                   >
//                     {" "}
//                     {isListening ? (
//                       <MicOff size={18} />
//                     ) : (
//                       <Mic size={18} />
//                     )}{" "}
//                   </Button>
//                   <Button
//                     size="icon"
//                     onClick={handleSendChatMessage}
//                     disabled={
//                       (!chatInput.trim() && !awaitingConfirmation) ||
//                       (isChatLoading && !awaitingConfirmation)
//                     }
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
//                     aria-label="Send chat message"
//                   >
//                     {" "}
//                     <Send size={18} />{" "}
//                   </Button>
//                 </div>
//               </CardFooter>
//             </Card>
//           </div>
//         </>
//       )}

//       {/* Add/Edit Habit Modal */}
//       {/* ... Keep existing JSX ... */}
//       <Dialog open={isHabitModalOpen} onClose={closeHabitModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {" "}
//               {editingHabit ? "Edit Habit" : "Add New Habit"}{" "}
//             </DialogTitle>
//           </DialogHeader>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleHabitModalSave();
//             }}
//           >
//             <div className="space-y-4">
//               <div>
//                 <label
//                   htmlFor="habit-title-modal"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   {" "}
//                   Title <span className="text-red-500">*</span>{" "}
//                 </label>
//                 <Input
//                   id="habit-title-modal"
//                   value={newHabitTitle}
//                   onChange={(e) => setNewHabitTitle(e.target.value)}
//                   placeholder="E.g., Exercise daily"
//                   className="w-full"
//                   autoFocus
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   {" "}
//                   Habit Type{" "}
//                 </label>
//                 <RadioGroup
//                   /* Removed value/onValueChange props from mock component */ className="flex space-x-4"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem
//                       value="good"
//                       id="type-good"
//                       checked={newHabitType === "good"}
//                       onChange={(e) => setNewHabitType(e.target.value)}
//                     />
//                     <label
//                       htmlFor="type-good"
//                       className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       {" "}
//                       Build Good Habit{" "}
//                     </label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem
//                       value="bad"
//                       id="type-bad"
//                       checked={newHabitType === "bad"}
//                       onChange={(e) => setNewHabitType(e.target.value)}
//                     />
//                     <label
//                       htmlFor="type-bad"
//                       className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       {" "}
//                       Break Bad Habit{" "}
//                     </label>
//                   </div>
//                 </RadioGroup>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label
//                     htmlFor="habit-start-modal"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                   >
//                     {" "}
//                     Start Date <span className="text-red-500">*</span>{" "}
//                   </label>
//                   <Input
//                     id="habit-start-modal"
//                     type="date"
//                     value={newHabitStartDate}
//                     onChange={(e) => setNewHabitStartDate(e.target.value)}
//                     className="w-full"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label
//                     htmlFor="habit-end-modal"
//                     className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                   >
//                     {" "}
//                     End Date <span className="text-xs">(Optional)</span>{" "}
//                   </label>
//                   <Input
//                     id="habit-end-modal"
//                     type="date"
//                     value={newHabitEndDate}
//                     onChange={(e) => setNewHabitEndDate(e.target.value)}
//                     className="w-full"
//                     min={newHabitStartDate}
//                   />
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={closeHabitModal}>
//                 {" "}
//                 Cancel{" "}
//               </Button>
//               {/* Updated Button variant for dark mode consistency */}
//               <Button
//                 type="submit"
//                 variant="default"
//                 className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
//               >
//                 {" "}
//                 {editingHabit ? "Save Changes" : "Add Habit"}{" "}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Custom CSS for Calendar and Scrollbars */}
//       {/* --- Keep existing style block --- */}
//       {/* Add !important cautiously, prefer higher specificity if possible */}
//       {/* Updated some react-calendar styles for better dark mode */}
//       <style>{`
//         /* Calendar Wrapper */
//         .react-calendar-wrapper { max-width: 100%; padding: 0rem; }
//         .react-calendar { width: 100% !important; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: transparent; font-family: inherit; }
//         .dark .react-calendar { border-color: #374151; background: transparent; } /* Ensure transparent background */

//         /* Navigation */
//         .react-calendar__navigation button { min-width: 40px; color: #374151; font-weight: 600; }
//         .dark .react-calendar__navigation button { color: #d1d5db; }
//         .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; }
//         .dark .react-calendar__navigation button:enabled:hover, .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; }
//         .react-calendar__navigation__label { font-weight: bold; }
//         .dark .react-calendar__navigation__label { color: #e5e7eb; }

//         /* Weekdays */
//         .react-calendar__month-view__weekdays__weekday { color: #6b7280; text-align: center; font-weight: bold; text-decoration: none; padding: 0.5em; }
//         .dark .react-calendar__month-view__weekdays__weekday abbr { color: #9ca3af; text-decoration: none; } /* Target abbr for text color */

//         /* Days */
//         .react-calendar__tile { border-radius: 0.375rem; transition: background-color 0.2s; padding: 0.5em 0.5em; line-height: 1.2; border: 1px solid transparent; text-align: center; }
//         .react-calendar__month-view__days__day { color: #1f2937; } /* Default day text color */
//         .dark .react-calendar__month-view__days__day { color: #e5e7eb; } /* Dark mode day text color */
//         .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; }
//         .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; }
//         .react-calendar__tile:disabled { background-color: #f9fafb; color: #9ca3af; }
//         .dark .react-calendar__tile:disabled { background-color: #1f2937; color: #6b7280; }
//         .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #e5e7eb; }
//         .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus { background-color: #374151; }

//         /* Specific Day States */
//         .react-calendar__tile--now { background: #dbeafe; font-weight: bold; border: 1px solid #bfdbfe; }
//         .dark .react-calendar__tile--now { background: #1e3a8a; border-color: #3b82f6; }
//         .react-calendar__tile--active { background: #60a5fa !important; color: white !important; } /* Use stronger selector or !important */
//         .dark .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
//         .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; }
//         .dark .react-calendar__tile--active:enabled:hover, .dark .react-calendar__tile--active:enabled:focus { background: #2563eb !important; }

//         /* Custom Habit Day Styles */
//         .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; }
//         .habit-day-some-complete { background-color: #fef9c3 !important; border-color: #fde047 !important; color: #854d0e !important; } /* Example style, adjust as needed */
//         .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
//         .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; }

//         /* Dark mode Habit Styles */
//         .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }
//         .dark .habit-day-some-complete { background-color: #78350f !important; border-color: #fbbf24 !important; color: #fef08a !important; }
//         .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }
//         .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }

//         /* Ensure active day text is readable in dark mode habit tiles */
//         .dark .react-calendar__tile--active.habit-day-all-complete,
//         .dark .react-calendar__tile--active.habit-day-some-complete,
//         .dark .react-calendar__tile--active.habit-day-all-missed,
//         .dark .react-calendar__tile--active.habit-day-partial-log {
//           color: white !important; /* Override habit tile color for active day */
//         }
//         .react-calendar__tile--active.habit-day-all-complete,
//         .react-calendar__tile--active.habit-day-some-complete,
//         .react-calendar__tile--active.habit-day-all-missed,
//         .react-calendar__tile--active.habit-day-partial-log {
//           color: white !important; /* Override habit tile color for active day */
//         }

//         /* Scrollbar styling */
//         .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
//         .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; }
//         .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 0.25rem; }
//         .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 0.25rem; }
//         .scrollbar-track-transparent::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
//         .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; }
//         ::-webkit-scrollbar-track { background: transparent; }
//       `}</style>
//     </div>
//   );
// }

// export default App;

////veresion-4

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
import "react-calendar/dist/Calendar.css";

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
  Repeat,
  Zap,
  Settings,
  Info,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Sun, // Icon for Light Mode
  Moon, // Icon for Dark Mode
} from "lucide-react";

// --- Dark Mode Hook ---
import { useDarkMode } from "./useDarkMode"; // Adjust path if needed

// --- Hardcoded API Key ---
const GEMINI_API_KEY = "AIzaSyDRSwIOzdttALUQtOXkPkhgTvG5w-oOxeU"; // Replace later
console.warn(
  "Using hardcoded GEMINI_API_KEY for development. Replace before production!"
);
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const parseDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  // Use Date.UTC to avoid timezone issues when comparing dates
  const date = new Date(Date.UTC(year, month - 1, day));
  // Check if the constructed date is valid
  return isNaN(date.getTime()) ? null : date;
};

// --- Mock shadcn/ui Components (Simplified) ---
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
const RadioGroup = ({ children, className = "", ...props }) => (
  <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
    {children}
  </div>
);
const RadioGroupItem = ({
  value,
  id,
  checked,
  onChange,
  className = "",
  ...props
}) => (
  <input
    type="radio"
    id={id}
    value={value}
    checked={checked}
    onChange={onChange}
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
  // ... (keep existing function)
  if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
    console.error("Motivation Suggestion Error: API Key or Endpoint missing.");
    return undefined;
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
      // Ensure all dates are valid before comparison
      return s && today && today >= s && (!e || today <= e);
    } catch (e) {
      return false;
    } // Ignore habits with invalid dates
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
  console.log("Sending motivation prompt:", prompt); // Log the prompt
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
      } catch (e) {}
      console.error("Gemini Motivation API Error:", errorBody);
      throw new Error(`API request failed: ${errorBody}`);
    }
    const data = await response.json();
    console.log("Received motivation data:", data); // Log response data
    const suggestionText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!suggestionText) {
      console.error("Could not parse suggestion text from response:", data);
      return "Keep building those habits!";
    } // Fallback suggestion
    console.log("Received motivation suggestion:", suggestionText);
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
    return { text: "AI features disabled." };

  const todayStr = formatDate(new Date());
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
    generationConfig: { maxOutputTokens: 500 }, // Increased slightly for potential batch actions
  };
  console.log("Sending chat request body (shortened):", {
    contents: [
      { role: "user", parts: [{ text: "System Instruction..." }] },
      ...historyForAPI.slice(-2),
    ],
  });

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
      } catch (e) {}
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
    console.log("Received chat data:", data);

    const chatResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!chatResponseText) {
      console.error("Could not parse chat response text:", data);
      return { text: "Sorry, I couldn't process the AI response." };
    }
    console.log("Received raw chat response text:", chatResponseText);

    // --- Updated Parsing Logic ---
    let actionData = null;
    let responseText = chatResponseText.trim();
    let potentialJson = null; // Variable to hold parsed JSON

    const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/;
    const fenceMatch = responseText.match(jsonFenceRegex);

    try {
      let jsonStringToParse = null;
      if (fenceMatch && fenceMatch[1]) {
        jsonStringToParse = fenceMatch[1].trim();
        responseText = ""; // Assume fence contains the entire intended JSON response
        console.log("Found JSON fence.");
      } else if (responseText.startsWith("{") && responseText.endsWith("}")) {
        // Try parsing directly only if it looks like an object
        jsonStringToParse = responseText;
        responseText = ""; // Assume direct parse means the entire response was JSON
        console.log("Attempting direct JSON object parse.");
      }

      if (jsonStringToParse) {
        potentialJson = JSON.parse(jsonStringToParse);
        console.log("Successfully parsed JSON:", potentialJson);
      }
    } catch (e) {
      potentialJson = null;
      console.log(
        "Response is not valid JSON or not wrapped/formatted as expected, treating as text.",
        e
      );
      // IMPORTANT: Ensure responseText holds the original text if parsing failed or wasn't attempted
      responseText = chatResponseText.trim();
    }

    // Check if the parsed JSON is a recognized action structure
    if (potentialJson) {
      // Check for the NEW batch action structure first
      if (
        typeof potentialJson === "object" &&
        potentialJson.action === ACTION_BATCH_ACTIONS &&
        Array.isArray(potentialJson.actions)
      ) {
        console.log("Parsed response as BATCH actions object.");
        // Validate inner actions (basic check)
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
          responseText = chatResponseText.trim(); // Restore original text
        }
      }
      // Check for single action object
      else if (typeof potentialJson === "object" && potentialJson.action) {
        console.log("Parsed response as a SINGLE action object.");
        actionData = potentialJson;
        // Normalize properties (keep existing null checks)
        actionData.title = actionData.title || null;
        actionData.habits = actionData.habits || null; // For suggest_habits
        actionData.startDate = actionData.startDate || null;
        actionData.endDate = actionData.endDate || null;
        actionData.date = actionData.date || null; // For complete_habit_date
        actionData.status = actionData.status ?? null; // For complete_habit_date
        actionData.type = actionData.type || "good"; // Default for add_habit
        return actionData; // Return the single action object
      } else {
        console.warn(
          "Parsed JSON, but it's not a recognized action structure. Treating as text."
        );
        // If it's JSON but not an action, fall back to text
        responseText = chatResponseText.trim(); // Restore original text
      }
    }

    // If it wasn't a valid single action or batch action structure, return as general chat
    console.log("Returning as general chat text:", responseText);
    return { text: responseText, action: ACTION_GENERAL_CHAT };
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitType, setNewHabitType] = useState("good");
  const [newHabitStartDate, setNewHabitStartDate] = useState(
    formatDate(new Date())
  );
  const [newHabitEndDate, setNewHabitEndDate] = useState("");
  const [currentDate] = useState(new Date());
  const [aiSuggestion, setAiSuggestion] = useState(
    GEMINI_API_KEY ? "Loading suggestion..." : "AI features disabled."
  );
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
            loadedHabits = parsed;
            console.log(`Loaded ${loadedHabits.length} habits.`);
          } else {
            console.warn("Stored habits data is not an array.");
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
            loadedLog = parsed;
            console.log(
              `Loaded habit log for ${Object.keys(loadedLog).length} dates.`
            );
          } else {
            console.warn("Stored habit log data is not an object.");
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
        loadedName = storedName;
        console.log("Loaded name:", loadedName);
      }
    } catch (e) {
      console.error("Error accessing username from localStorage:", e);
    }
    setHabits(loadedHabits);
    setHabitLog(loadedLog);
    setUserName(loadedName);
    console.log("Initial data loading complete.");
  }, []);
  // Save data effects
  useEffect(() => {
    try {
      if (habits.length > 0 || localStorage.getItem("dayPlannerHabits"))
        localStorage.setItem("dayPlannerHabits", JSON.stringify(habits));
    } catch (e) {
      console.error("Save Habit Error:", e);
    }
  }, [habits]);
  useEffect(() => {
    try {
      if (
        Object.keys(habitLog).length > 0 ||
        localStorage.getItem("dayPlannerHabitLog")
      )
        localStorage.setItem("dayPlannerHabitLog", JSON.stringify(habitLog));
    } catch (e) {
      console.error("Save Log Error:", e);
    }
  }, [habitLog]);
  useEffect(() => {
    if (userName !== "User")
      try {
        localStorage.setItem("dayPlannerUserName", userName);
      } catch (e) {
        console.error("Save Name Error:", e);
      }
  }, [userName]);
  // Fetch AI Suggestion effect
  useEffect(() => {
    if (!GEMINI_API_KEY || !GEMINI_API_ENDPOINT) {
      setAiSuggestion("AI features disabled.");
      setIsLoadingSuggestion(false);
      return;
    }
    console.log(`App loaded, fetching initial motivation.`);
    setIsLoadingSuggestion(true);
    setAiSuggestion("Getting suggestion...");
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
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Fetch only once on initial load
  // Scroll chat effect
  useEffect(() => {
    if (isChatOpen && chatHistory.length > 0) {
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatHistory, isChatOpen]);

  // --- Habit Management Callbacks ---
  const closeHabitModal = useCallback(() => {
    console.log("Closing habit modal");
    setIsHabitModalOpen(false);
    setEditingHabit(null);
    setNewHabitTitle("");
    setNewHabitType("good");
    setNewHabitStartDate(formatDate(new Date()));
    setNewHabitEndDate("");
  }, []);
  const upsertHabit = useCallback(
    (habitData) => {
      try {
        console.log("Upserting habit:", habitData);
        const newHabit = {
          id:
            habitData.id ||
            `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: (habitData.title || "").trim(),
          type: habitData.type === "bad" ? "bad" : "good",
          startDate: habitData.startDate || formatDate(new Date()), // Default start date
          endDate: habitData.endDate || null,
        };
        if (!newHabit.title) {
          console.warn("Attempted to add habit without title.");
          return; // Don't add empty habits
        } // Validate dates
        const startD = parseDate(newHabit.startDate);
        const endD = newHabit.endDate ? parseDate(newHabit.endDate) : null;
        if (!startD) {
          alert("Invalid start date format. Please use YYYY-MM-DD.");
          return;
        }
        if (newHabit.endDate && !endD) {
          alert(
            "Invalid end date format. Please use YYYY-MM-DD or leave blank."
          );
          return;
        }
        if (endD && startD > endD) {
          alert("Habit end date cannot be before the start date.");
          return;
        }
        setHabits((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const existingIndex = safePrev.findIndex((h) => h.id === newHabit.id);
          let updatedHabits = [...safePrev];
          if (existingIndex > -1) {
            updatedHabits[existingIndex] = newHabit;
          } else {
            updatedHabits.push(newHabit);
          }
          updatedHabits.sort((a, b) => a.title.localeCompare(b.title));
          console.log("Habits state updated:", updatedHabits.length);
          return updatedHabits;
        });
      } catch (e) {
        console.error("Upsert Habit Error:", e);
      }
    },
    [setHabits]
  );
  const handleHabitModalSave = useCallback(() => {
    console.log("Handling habit modal save");
    if (!newHabitTitle.trim()) {
      alert("Habit title required.");
      return;
    }
    upsertHabit({
      id: editingHabit?.id,
      title: newHabitTitle,
      type: newHabitType,
      startDate: newHabitStartDate,
      endDate: newHabitEndDate || null, // Ensure null if empty
    });
    closeHabitModal();
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
      const exactMatch = habits.find(
        (h) => h.title.trim().toLowerCase() === searchTerm
      );
      if (exactMatch) {
        console.log(`Found exact habit match: ${exactMatch.id}`);
        return exactMatch.id;
      } // Optional: Add partial matching if desired, but be careful with ambiguity
      const partialMatches = habits.filter((h) =>
        h.title.trim().toLowerCase().includes(searchTerm)
      );
      if (partialMatches.length === 1) {
        console.log(
          `Found single partial habit match: ${partialMatches[0].id}`
        );
        return partialMatches[0].id;
      }
      if (partialMatches.length > 1) {
        console.warn(
          `Ambiguous habit title: "${title}". Found ${partialMatches.length} partial matches.`
        );
        return null; // Don't return if ambiguous
      }
      console.log(`Habit not found: "${title}"`);
      return null;
    },
    [habits]
  );
  const handleDeleteHabitCallback = useCallback(
    (id) => {
      try {
        if (!id) return;
        console.log("Deleting habit:", id);
        setHabits((prev) =>
          (Array.isArray(prev) ? prev : []).filter((h) => h.id !== id)
        );
        setHabitLog((prevLog) => {
          const newLog = { ...(prevLog || {}) };
          Object.keys(newLog).forEach((date) => {
            if (newLog[date]?.[id] !== undefined) {
              delete newLog[date][id];
              if (Object.keys(newLog[date]).length === 0) delete newLog[date];
            }
          });
          console.log(
            "Habit log updated after delete:",
            Object.keys(newLog).length
          );
          return newLog;
        });
      } catch (e) {
        console.error("Delete Habit Error:", e);
      }
    },
    [setHabits, setHabitLog]
  );
  const openModalForEditHabit = useCallback((habit) => {
    console.log("Opening habit modal for edit:", habit);
    setEditingHabit(habit);
    setNewHabitTitle(habit.title);
    setNewHabitType(habit.type || "good");
    setNewHabitStartDate(habit.startDate);
    setNewHabitEndDate(habit.endDate || "");
    setIsHabitModalOpen(true);
  }, []);
  const openModalForNewHabit = useCallback(() => {
    console.log("Opening habit modal for new");
    setEditingHabit(null);
    setNewHabitTitle("");
    setNewHabitType("good");
    setNewHabitStartDate(formatDate(new Date()));
    setNewHabitEndDate("");
    setIsHabitModalOpen(true);
  }, []);
  const setHabitCompletionStatus = useCallback(
    (habitId, date, desiredStatus) => {
      try {
        const dateStr = formatDate(date);
        if (!dateStr || !habitId) return;
        console.log(
          `Setting habit ${habitId} for ${dateStr} to ${desiredStatus}`
        );
        setHabitLog((prevLog) => {
          const safePrevLog = prevLog || {};
          const dayLog = { ...(safePrevLog[dateStr] || {}) };
          const currentStatus = dayLog[habitId]; // Toggle logic: if clicking the same status, unset it (back to pending)
          if (currentStatus === desiredStatus) {
            delete dayLog[habitId];
            console.log(`Unset habit ${habitId} for ${dateStr}`);
          } else {
            dayLog[habitId] = desiredStatus;
            console.log(
              `Set habit ${habitId} for ${dateStr} to ${desiredStatus}`
            );
          }
          const newLog = { ...safePrevLog };
          if (Object.keys(dayLog).length === 0) {
            delete newLog[dateStr];
          } else {
            newLog[dateStr] = dayLog;
          }
          console.log("Habit log updated count:", Object.keys(newLog).length);
          return newLog;
        });
      } catch (e) {
        console.error("Set Habit Status Error:", e);
      }
    },
    [setHabitLog]
  );

  // --- Chat Handling ---
  const handleSendChatMessage = useCallback(async () => {
    const messageText = chatInput.trim();
    console.log(
      `handleSendChatMessage called. Message: "${messageText}", Awaiting: ${awaitingConfirmation}`
    );
    if (!messageText && !awaitingConfirmation) return;
    if (isChatLoading) {
      console.log("Chat is already loading.");
      return;
    }

    const newUserMessage = { sender: "user", text: messageText };

    // --- Confirmation Flow ---
    if (awaitingConfirmation && pendingActionData) {
      console.log("Processing confirmation...");
      try {
        setChatHistory((prev) => [...prev, newUserMessage]);
        setChatInput("");
        const userConfirmation = messageText.toLowerCase();
        let confirmationResponseText = "";
        let performAction = false;
        if (userConfirmation === "yes" || userConfirmation === "y")
          performAction = true;
        else if (userConfirmation === "no" || userConfirmation === "n")
          confirmationResponseText = "Okay, action cancelled.";
        else {
          confirmationResponseText = `Please confirm with 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;
        }
        if (performAction) {
          try {
            console.log(
              "Performing confirmed action:",
              pendingActionData.action
            );
            switch (pendingActionData.action) {
              case ACTION_DELETE_HABIT:
                pendingActionData.habitIds?.forEach((id) =>
                  handleDeleteHabitCallback(id)
                );
                confirmationResponseText = `Okay, deleted habit "${pendingActionData.title}".`;
                break; // Use title from pending data
              case ACTION_SUGGEST_HABITS:
                pendingActionData.habits?.forEach((h) => upsertHabit(h));
                confirmationResponseText = `Okay, added suggested habit(s).`;
                break;
              case ACTION_DELETE_ALL_HABITS:
                console.log("Deleting all habits confirmed.");
                setHabits([]);
                setHabitLog({});
                confirmationResponseText = "Okay, deleted all habits.";
                break;
              case ACTION_COMPLETE_ALL_HABITS_TODAY:
                console.log("Completing all habits for today confirmed.");
                const todayStr = formatDate(new Date());
                const activeHabitsToday = (
                  Array.isArray(habits) ? habits : []
                ).filter((h) => {
                  if (!h || !h.startDate) return false;
                  try {
                    const s = parseDate(h.startDate);
                    const e = h.endDate ? parseDate(h.endDate) : null;
                    const today = parseDate(todayStr);
                    if (!s || !today) return false;
                    if (h.endDate && !e) return false;
                    return today >= s && (!e || today <= e);
                  } catch (filterError) {
                    console.error(
                      "Error filtering habit in COMPLETE_ALL:",
                      h,
                      filterError
                    );
                    return false;
                  }
                });
                const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
                  ? activeHabitsToday
                      .map((h) => h && h.id)
                      .filter((id) => id != null)
                  : [];
                if (!Array.isArray(activeHabitsTodayIds)) {
                  console.error(
                    "Error: activeHabitsTodayIds is not an array in COMPLETE_ALL action."
                  );
                  confirmationResponseText = "Error processing active habits.";
                } else if (activeHabitsTodayIds.length > 0) {
                  activeHabitsTodayIds.forEach((id) =>
                    setHabitCompletionStatus(id, new Date(), true)
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
          } catch (error) {
            console.error("Error performing confirmed action:", error);
            confirmationResponseText =
              "Sorry, there was an error performing the action.";
          }
        }
        if (confirmationResponseText) {
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: confirmationResponseText },
          ]);
        }
        if (
          performAction ||
          userConfirmation === "no" ||
          userConfirmation === "n"
        ) {
          setPendingActionData(null);
          setAwaitingConfirmation(false);
        }
      } catch (error) {
        console.error("Error during confirmation flow:", error);
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "An error occurred during confirmation." },
        ]);
        setPendingActionData(null);
        setAwaitingConfirmation(false);
      } finally {
        setTimeout(() => chatInputRef.current?.focus(), 0);
      }
      return;
    }

    // --- Regular Chat / New Action Request ---
    console.log("Processing new chat message...");
    setIsChatLoading(true);
    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput("");

    try {
      const currentChatHistory = [...chatHistory, newUserMessage];
      console.log("Calling fetchChatResponse...");
      const botResponse = await fetchChatResponse(
        habits,
        habitLog,
        currentChatHistory,
        messageText,
        userName
      );
      console.log("Received bot response object:", botResponse);

      let requiresConfirmation = false;
      let confirmationPrompt = "";
      let chatMessageToAdd = "";
      let actionDataForConfirmation = null;

      if (!botResponse || (!botResponse.action && !botResponse.text)) {
        throw new Error("Invalid or empty bot response received.");
      }

      // --- Updated Action Handling Block ---
      if (botResponse.action && botResponse.action !== ACTION_GENERAL_CHAT) {
        // Process Single or Batch Actions
        actionDataForConfirmation = {
          action: botResponse.action,
          confirmationPrompt: "",
        }; // Initialize for potential confirmation

        try {
          switch (botResponse.action) {
            case ACTION_ADD_HABIT: // Single Add
              upsertHabit({
                title: botResponse.title,
                type: botResponse.type,
                startDate: botResponse.startDate,
                endDate: botResponse.endDate,
              });
              chatMessageToAdd = `Okay, added habit "${botResponse.title}".`;
              break;

            case ACTION_BATCH_ACTIONS: // Batch Add (or potentially others later)
              if (Array.isArray(botResponse.actions)) {
                console.log(
                  `Processing ${botResponse.actions.length} batch actions.`
                );
                let addedCount = 0;
                let failedTitles = [];
                botResponse.actions.forEach((action) => {
                  // Currently only handling batched ADD_HABIT
                  if (action.action === ACTION_ADD_HABIT && action.title) {
                    upsertHabit({
                      title: action.title,
                      type: action.type || "good", // Use default if missing
                      startDate: action.startDate, // Will default in upsertHabit if null/invalid
                      endDate: action.endDate, // Will default in upsertHabit if null/invalid
                    });
                    addedCount++;
                  } else {
                    console.warn(
                      "Unsupported or invalid action in batch:",
                      action
                    );
                    if (action.title) failedTitles.push(action.title);
                  }
                });

                // Construct batch response message
                if (addedCount > 0 && failedTitles.length === 0) {
                  chatMessageToAdd = `Okay, added ${addedCount} habits.`;
                } else if (addedCount > 0 && failedTitles.length > 0) {
                  chatMessageToAdd = `Okay, added ${addedCount} habits. Couldn't add: ${failedTitles.join(
                    ", "
                  )}.`;
                } else if (addedCount === 0 && failedTitles.length > 0) {
                  chatMessageToAdd = `Sorry, couldn't add the requested habits: ${failedTitles.join(
                    ", "
                  )}.`;
                } else if (addedCount === 0 && botResponse.actions.length > 0) {
                  chatMessageToAdd =
                    "Sorry, I couldn't process the requested habit additions from the batch.";
                } else {
                  chatMessageToAdd =
                    "No actions were processed from the batch response.";
                }
              } else {
                chatMessageToAdd =
                  "Received batch action request but actions array is missing or invalid.";
                console.warn("Invalid batch_actions structure:", botResponse);
              }
              break; // End of batch actions case

            case ACTION_DELETE_HABIT:
              const habitIdToDelete = findHabitIdByTitle(botResponse.title);
              if (habitIdToDelete) {
                requiresConfirmation = true;
                confirmationPrompt = `Delete habit "${botResponse.title}" and all its logs? (yes/no)`;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  habitIds: [habitIdToDelete],
                  title: botResponse.title,
                  confirmationPrompt,
                }; // Store title too
              } else {
                chatMessageToAdd = `Couldn't find habit "${botResponse.title}" to delete.`;
              }
              break;

            case ACTION_COMPLETE_HABIT_DATE:
              const habitIdToLog = findHabitIdByTitle(botResponse.title);
              const dateToLogStr = botResponse.date || formatDate(new Date());
              const statusToLog = botResponse.status;
              const parsedDateToLog = parseDate(dateToLogStr); // Use UTC parser
              if (habitIdToLog && parsedDateToLog && statusToLog !== null) {
                setHabitCompletionStatus(
                  habitIdToLog,
                  parsedDateToLog,
                  statusToLog
                );
                const habitInfo = habits.find((h) => h.id === habitIdToLog);
                const statusText = statusToLog
                  ? habitInfo?.type === "bad"
                    ? "avoided"
                    : "done"
                  : habitInfo?.type === "bad"
                  ? "indulged"
                  : "missed";
                chatMessageToAdd = `Okay, marked habit "${botResponse.title}" as ${statusText} for ${dateToLogStr}.`;
              } else {
                chatMessageToAdd = `Couldn't log habit "${botResponse.title}" for ${dateToLogStr}. Check title/date format (YYYY-MM-DD) and ensure habit exists.`;
              }
              break;

            case ACTION_SUGGEST_HABITS:
              if (
                Array.isArray(botResponse.habits) &&
                botResponse.habits.length > 0
              ) {
                requiresConfirmation = true;
                const habitTitles = botResponse.habits
                  .map((h) => `"${h.title}"`)
                  .join(", ");
                confirmationPrompt = `AI suggests adding habits: ${habitTitles}. Add them? (yes/no)`;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  habits: botResponse.habits,
                  confirmationPrompt,
                };
              } else {
                chatMessageToAdd =
                  "AI couldn't suggest habits based on the request.";
              }
              break;

            case ACTION_DELETE_ALL_HABITS:
              if (habits.length > 0) {
                requiresConfirmation = true;
                confirmationPrompt = `Are you sure you want to delete all ${habits.length} habits and their logs? This cannot be undone. (yes/no)`;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt,
                };
              } else {
                chatMessageToAdd = "You don't have any habits to delete.";
              }
              break;

            case ACTION_COMPLETE_ALL_HABITS_TODAY:
              const todayStr = formatDate(new Date());
              const activeHabitsToday = (
                Array.isArray(habits) ? habits : []
              ).filter((h) => {
                if (!h || !h.startDate) return false;
                try {
                  const s = parseDate(h.startDate);
                  const e = h.endDate ? parseDate(h.endDate) : null;
                  const today = parseDate(todayStr);
                  if (!s || !today) return false;
                  if (h.endDate && !e) return false;
                  return today >= s && (!e || today <= e);
                } catch (filterError) {
                  return false;
                }
              });
              const activeHabitsTodayIds = Array.isArray(activeHabitsToday)
                ? activeHabitsToday.map((h) => h?.id).filter((id) => id != null)
                : [];
              if (!Array.isArray(activeHabitsTodayIds)) {
                chatMessageToAdd = "Error calculating active habits for today.";
              } else if (activeHabitsTodayIds.length > 0) {
                requiresConfirmation = true;
                confirmationPrompt = `Mark all ${activeHabitsTodayIds.length} active habits for today as done/avoided? (yes/no)`;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt,
                };
              } else {
                chatMessageToAdd =
                  "No habits are active today to mark as complete.";
              }
              break;

            default:
              chatMessageToAdd =
                "Sorry, I received an unknown habit action request.";
              console.warn("Unknown action:", botResponse.action);
          } // End switch
        } catch (actionError) {
          console.error(
            `Error processing action ${botResponse.action}:`,
            actionError
          );
          chatMessageToAdd = `Sorry, there was an error processing the action: ${botResponse.action}.`;
          requiresConfirmation = false; // Cancel confirmation on error
        }
      } else {
        // General Chat or invalid response structure
        chatMessageToAdd =
          botResponse.text || "Sorry, I didn't understand that.";
        console.log("Handling general chat response or fallback.");
        // Check for name update
        const lowerCaseMsg = messageText.toLowerCase();
        if (
          lowerCaseMsg.startsWith("my name is ") ||
          lowerCaseMsg.startsWith("i'm ") ||
          lowerCaseMsg.startsWith("im ")
        ) {
          const potentialName = messageText
            .substring(messageText.lastIndexOf(" ") + 1)
            .replace(/[^a-zA-Z]/g, "");
          if (potentialName?.length > 1) {
            const name =
              potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
            setUserName(name);
            console.log(`Potential name detected and set: ${name}`);
            chatMessageToAdd = `Nice to meet you, ${name}! How can I help with your habits?`;
          }
        }
      }
      // --- End of Updated Action Handling Block ---

      // Set confirmation state if needed (outside the switch now)
      if (
        requiresConfirmation &&
        actionDataForConfirmation?.confirmationPrompt
      ) {
        setPendingActionData(actionDataForConfirmation);
        setAwaitingConfirmation(true);
        chatMessageToAdd = confirmationPrompt; // Override chat message with prompt
        console.log("Set state for confirmation:", actionDataForConfirmation);
      }

      // Add the resulting message (either action result, prompt, or general chat)
      if (chatMessageToAdd) {
        console.log("Adding bot message to chat:", chatMessageToAdd);
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: chatMessageToAdd },
        ]);
      } else if (!requiresConfirmation) {
        // Only warn if no message AND no confirmation required
        console.warn(
          "No chat message generated and no confirmation needed:",
          botResponse
        );
      }
    } catch (error) {
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
    } finally {
      setIsChatLoading(false);
      if (!awaitingConfirmation) {
        // Only focus if not waiting for confirmation
        try {
          setTimeout(() => chatInputRef.current?.focus(), 0);
        } catch (e) {
          /* ignore focus error */
        }
      }
      console.log("handleSendChatMessage finished.");
    }
  }, [
    chatInput,
    chatHistory,
    habits,
    habitLog,
    isChatLoading,
    upsertHabit,
    findHabitIdByTitle,
    handleDeleteHabitCallback,
    setHabitCompletionStatus,
    awaitingConfirmation,
    pendingActionData,
    userName,
    setUserName,
    setHabits,
    setHabitLog,
  ]); // Keep dependencies

  const handleChatInputKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendChatMessage();
    }
  };
  const toggleChat = useCallback(() => {
    console.log("Toggling chat visibility");
    setIsChatOpen((prev) => !prev);
  }, []);

  // --- Voice Input Logic ---
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API not supported.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice started.");
      setChatInput("Listening...");
    };
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log("Voice transcript:", transcript);
      setChatInput(transcript); // Update input field
      // Optional: Automatically send after speech ends? Needs careful implementation
    };
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      let errorMsg = `Speech error: ${event.error}`;
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        errorMsg =
          "Microphone permission denied. Please allow microphone access in your browser settings.";
      } else if (event.error === "no-speech") {
        errorMsg = "No speech detected. Please try again.";
      } else if (event.error === "audio-capture") {
        errorMsg = "Microphone error. Ensure it's connected and working.";
      }
      setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      setIsListening(false);
      if (chatInput === "Listening...") setChatInput(""); // Clear "Listening..." on error
    };
    recognition.onend = () => {
      console.log("Voice ended.");
      setIsListening(false); // Maybe clear "Listening..." if input wasn't updated by result?
      if (
        chatInputRef.current &&
        chatInputRef.current.value === "Listening..."
      ) {
        setChatInput(""); // Clear placeholder if no result came through
      }
      chatInputRef.current?.focus(); // Focus input after listening stops
    };
    recognitionRef.current = recognition;
  }, [setChatHistory, setChatInput, chatInput]); // Added chatInput dependency for onend check

  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      recognitionRef.current?.abort();
    };
  }, [setupSpeechRecognition]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not initialized.");
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Speech recognition not available in this browser.",
        },
      ]);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      console.log("Manually stopping listening.");
    } else {
      // Request permission first (good practice, though start() implies it)
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("Mic permission granted. Starting recognition.");
          setChatInput(""); // Clear input before listening
          recognitionRef.current.start();
        })
        .catch((err) => {
          console.error("Mic access denied or error:", err);
          setChatHistory((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Microphone access denied. Please allow microphone access in browser settings.",
            },
          ]);
          setIsListening(false); // Ensure listening state is false
        });
    }
  };

  // --- Memoized Values ---
  const activeHabitsForSelectedDate = useMemo(() => {
    try {
      const selectedD = parseDate(formatDate(selectedDate));
      if (!selectedD || !Array.isArray(habits)) return [];
      return habits.filter((h) => {
        const startD = parseDate(h.startDate);
        const endD = h.endDate ? parseDate(h.endDate) : null;
        if (!startD) return false; // Ignore habits with invalid start dates
        // Check validity of end date only if it exists
        if (h.endDate && !endD) return false;
        return selectedD >= startD && (!endD || selectedD <= endD);
      });
    } catch (error) {
      console.error("Error calculating active habits:", error);
      return [];
    }
  }, [habits, selectedDate]);

  // --- Calendar Tile Styling ---
  const getTileClassName = ({ date, view: calendarView }) => {
    try {
      if (calendarView !== "month") return null;
      const dateStr = formatDate(date);
      if (!dateStr) return null;
      const logForDay = habitLog?.[dateStr];
      const safeHabits = Array.isArray(habits) ? habits : [];
      const habitsForDay = safeHabits.filter((h) => {
        const s = parseDate(h.startDate);
        const e = h.endDate ? parseDate(h.endDate) : null;
        const c = parseDate(dateStr); // Check validity
        if (!s || !c) return false;
        if (h.endDate && !e) return false;
        return c >= s && (!e || c <= e);
      });
      if (habitsForDay.length === 0) return null; // No active habits, no special style
      const completedCount = habitsForDay.filter(
        (h) => logForDay?.[h.id] === true
      ).length;
      const missedCount = habitsForDay.filter(
        (h) => logForDay?.[h.id] === false
      ).length;
      const loggedCount = completedCount + missedCount;

      // Determine class based on completion status
      if (loggedCount === 0) return null; // Nothing logged yet for this day
      if (completedCount === habitsForDay.length)
        return "habit-day-all-complete"; // All done
      if (missedCount === habitsForDay.length) return "habit-day-all-missed"; // All missed/indulged
      // If partially logged (some done, some missed, or some pending but at least one logged)
      if (loggedCount > 0) return "habit-day-partial-log";

      return null; // Default fallback
    } catch (error) {
      console.error("Error in getTileClassName:", error);
      return null;
    }
  };

  // --- Render JSX ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Habit Tracker
          </h1>
          <div className="flex items-center gap-4">
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
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 h-9 w-9"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden relative">
        {/* Left Column: Calendar & Daily Log */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
              <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={getTileClassName}
                  maxDate={new Date()} // Prevent selecting future dates
                  minDate={new Date(new Date().getFullYear() - 5, 0, 1)} // Example: Limit to past 5 years
                  className="text-sm" // Base styles handled by CSS
                />
              </div>
            </CardContent>
          </Card>
          {/* Daily Habit Log Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90">
            <CardHeader>
              <CardTitle className="text-lg">
                {" "}
                Log for {formatDate(selectedDate)}{" "}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeHabitsForSelectedDate.length > 0 ? (
                <ul className="space-y-3">
                  {activeHabitsForSelectedDate.map((habit) => {
                    const logStatus =
                      habitLog[formatDate(selectedDate)]?.[habit.id];
                    const isGoodHabit = habit.type !== "bad";
                    const doneText = isGoodHabit ? "Done" : "Avoided";
                    const missedText = isGoodHabit ? "Missed" : "Indulged";
                    const doneIcon = isGoodHabit ? (
                      <CheckCircle size={16} className="mr-1" />
                    ) : (
                      <CheckCircle size={16} className="mr-1" />
                    ); // CheckCircle for both for now
                    const missedIcon = isGoodHabit ? (
                      <XCircle size={16} className="mr-1" />
                    ) : (
                      <AlertTriangle size={16} className="mr-1" />
                    ); // Different icon for indulging

                    return (
                      <li
                        key={habit.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <span className="font-medium text-sm md:text-base flex items-center gap-2">
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
                          {habit.title}
                        </span>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {/* Done/Avoided Button */}
                          <Button
                            variant={
                              logStatus === true
                                ? isGoodHabit
                                  ? "default"
                                  : "default"
                                : "outline"
                            } // Greenish for both when done/avoided
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
                            } // Reddish for both when missed/indulged
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
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {" "}
                  No habits scheduled for this date.{" "}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Habit Management & AI Suggestion */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col overflow-hidden">
          {/* Habit AI Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {" "}
                <Brain size={20} className="text-blue-500" /> Habit Assistant{" "}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-start gap-2 shadow-sm border border-blue-200 dark:border-blue-800 flex-1 min-w-0">
              <Brain
                size={20}
                className={`flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 ${
                  isLoadingSuggestion ? "animate-pulse" : ""
                }`}
              />
              <span className="italic whitespace-pre-line text-xs sm:text-sm">
                {" "}
                {isLoadingSuggestion
                  ? "Getting suggestion..."
                  : aiSuggestion}{" "}
              </span>
            </CardContent>
            <CardFooter>
              <Button
                onClick={openModalForNewHabit}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
              >
                {" "}
                <Plus size={18} className="mr-2" /> Add New Habit{" "}
              </Button>
            </CardFooter>
          </Card>
          {/* Habit List Card */}
          <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col flex-grow overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {" "}
                <Settings
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />{" "}
                Manage Habits{" "}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {habits.length > 0 ? (
                <ul className="space-y-2">
                  {habits.map((habit) => (
                    <li
                      key={habit.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 group"
                    >
                      <div className="flex items-center space-x-2 text-sm">
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
                        <div>
                          <span className="font-medium block">
                            {" "}
                            {habit.title}{" "}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {" "}
                            {habit.startDate} to {habit.endDate || "Ongoing"}{" "}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 h-7 w-7"
                          onClick={() => openModalForEditHabit(habit)}
                          aria-label={`Edit habit ${habit.title}`}
                        >
                          {" "}
                          <Edit size={14} />{" "}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 h-7 w-7"
                          onClick={() => handleDeleteHabitCallback(habit.id)}
                          aria-label={`Delete habit ${habit.title}`}
                        >
                          {" "}
                          <Trash2 size={14} />{" "}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 flex flex-col items-center gap-2">
                  {" "}
                  <Info size={24} /> <span>No habits defined yet.</span>{" "}
                  <span>Click "Add New Habit" or ask the AI!</span>{" "}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button for Chat */}
        {!isChatOpen && (
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition-transform hover:scale-110"
            aria-label="Open Chat Assistant"
          >
            {" "}
            <MessageSquare size={24} />{" "}
          </Button>
        )}
      </main>

      {/* Chat Window (Drawer) */}
      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={toggleChat}
            aria-hidden="true"
          ></div>
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md lg:max-w-sm xl:max-w-md bg-white dark:bg-gray-900 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${
              isChatOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
              <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between p-4">
                <CardTitle
                  id="chat-title"
                  className="flex items-center gap-2 text-lg"
                >
                  {" "}
                  <MessageSquare
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />{" "}
                  Habit Assistant{" "}
                </CardTitle>
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="icon"
                  aria-label="Close Chat"
                >
                  {" "}
                  <X size={20} />{" "}
                </Button>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto space-y-4 py-4 px-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <Bot
                        size={24}
                        className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900"
                      />
                    )}
                    <div
                      className={`p-2.5 rounded-lg max-w-[85%] shadow-sm ${
                        // This outer div styles the message bubble
                        msg.sender === "user"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {/* Add a new div wrapper for prose styling */}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                        <ReactMarkdown
                          // No className prop here anymore
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline" // Styling links via components is still fine
                              />
                            ),
                            // You can add more component overrides here if needed for specific tags (p, ul, etc.)
                          }}
                        >
                          {msg.text || ""}
                        </ReactMarkdown>
                      </div>{" "}
                      {/* End of the new wrapper div */}
                    </div>
                    {msg.sender === "user" && (
                      <User
                        size={24}
                        className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-blue-100 dark:bg-blue-900"
                      />
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start gap-2.5">
                    {" "}
                    <Bot
                      size={24}
                      className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1 p-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 animate-pulse"
                    />{" "}
                    <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic">
                      {" "}
                      Assistant is thinking...{" "}
                    </div>{" "}
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4 bg-white dark:bg-gray-900 flex-shrink-0">
                <div className="flex w-full items-center space-x-2">
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
                    onKeyPress={handleChatInputKeyPress}
                    disabled={isChatLoading && !awaitingConfirmation}
                    aria-label="Chat input"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMicClick}
                    disabled={isChatLoading}
                    className={`text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 ${
                      isListening ? "text-red-500 animate-pulse" : ""
                    }`}
                    title={isListening ? "Stop Listening" : "Start Listening"}
                    aria-label={
                      isListening ? "Stop listening" : "Start voice input"
                    }
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
                    disabled={
                      (!chatInput.trim() && !awaitingConfirmation) ||
                      (isChatLoading && !awaitingConfirmation)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    aria-label="Send chat message"
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

      {/* Add/Edit Habit Modal */}
      <Dialog open={isHabitModalOpen} onClose={closeHabitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {" "}
              {editingHabit ? "Edit Habit" : "Add New Habit"}{" "}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleHabitModalSave();
            }}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="habit-title-modal"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {" "}
                  Title <span className="text-red-500">*</span>{" "}
                </label>
                <Input
                  id="habit-title-modal"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="E.g., Exercise daily"
                  className="w-full"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {" "}
                  Habit Type{" "}
                </label>
                <RadioGroup className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="good"
                      id="type-good"
                      checked={newHabitType === "good"}
                      onChange={(e) => setNewHabitType(e.target.value)}
                    />
                    <label
                      htmlFor="type-good"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {" "}
                      Build Good Habit{" "}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="bad"
                      id="type-bad"
                      checked={newHabitType === "bad"}
                      onChange={(e) => setNewHabitType(e.target.value)}
                    />
                    <label
                      htmlFor="type-bad"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {" "}
                      Break Bad Habit{" "}
                    </label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="habit-start-modal"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {" "}
                    Start Date <span className="text-red-500">*</span>{" "}
                  </label>
                  <Input
                    id="habit-start-modal"
                    type="date"
                    value={newHabitStartDate}
                    onChange={(e) => setNewHabitStartDate(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="habit-end-modal"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {" "}
                    End Date <span className="text-xs">(Optional)</span>{" "}
                  </label>
                  <Input
                    id="habit-end-modal"
                    type="date"
                    value={newHabitEndDate}
                    onChange={(e) => setNewHabitEndDate(e.target.value)}
                    className="w-full"
                    min={newHabitStartDate || undefined} // Set min based on start date
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeHabitModal}>
                {" "}
                Cancel{" "}
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
              >
                {" "}
                {editingHabit ? "Save Changes" : "Add Habit"}{" "}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for Calendar and Scrollbars */}
      <style>{`
        /* Calendar Wrapper */
        .react-calendar-wrapper { max-width: 100%; padding: 0rem; }
        .react-calendar { width: 100% !important; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: transparent; font-family: inherit; }
        .dark .react-calendar { border-color: #374151; background: transparent; }

        /* Navigation */
        .react-calendar__navigation button { min-width: 40px; color: #374151; font-weight: 600; }
        .dark .react-calendar__navigation button { color: #d1d5db; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; }
        .dark .react-calendar__navigation button:enabled:hover, .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; }
        .react-calendar__navigation__label { font-weight: bold; }
        .dark .react-calendar__navigation__label { color: #e5e7eb; }

        /* Weekdays */
        .react-calendar__month-view__weekdays__weekday { color: #6b7280; text-align: center; font-weight: bold; text-decoration: none; padding: 0.5em; }
        .dark .react-calendar__month-view__weekdays__weekday abbr { color: #9ca3af; text-decoration: none; }

        /* Days */
        .react-calendar__tile { border-radius: 0.375rem; transition: background-color 0.2s; padding: 0.5em 0.5em; line-height: 1.2; border: 1px solid transparent; text-align: center; cursor: pointer; }
        .react-calendar__month-view__days__day { color: #1f2937; }
        .dark .react-calendar__month-view__days__day { color: #e5e7eb; }
        .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; opacity: 0.7; }
        .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; opacity: 0.7; }
        .react-calendar__tile:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: 0.5; }
        .dark .react-calendar__tile:disabled { background-color: #1f2937; color: #6b7280; cursor: not-allowed; opacity: 0.5;}
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #e5e7eb; }
        .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus { background-color: #374151; }

        /* Specific Day States */
        .react-calendar__tile--now { background: #dbeafe; font-weight: bold; border: 1px solid #bfdbfe; }
        .dark .react-calendar__tile--now { background: #1e3a8a; border-color: #3b82f6; }
        .react-calendar__tile--active { background: #60a5fa !important; color: white !important; }
        .dark .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
        .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; }
        .dark .react-calendar__tile--active:enabled:hover, .dark .react-calendar__tile--active:enabled:focus { background: #2563eb !important; }

        /* Custom Habit Day Styles */
        .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; }
        .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
        .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; }

        /* Dark mode Habit Styles */
        .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }
        .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }
        .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }

        /* Ensure active day text is readable in dark mode habit tiles */
        .dark .react-calendar__tile--active.habit-day-all-complete,
        .dark .react-calendar__tile--active.habit-day-all-missed,
        .dark .react-calendar__tile--active.habit-day-partial-log {
          color: white !important; /* Override habit tile color for active day */
        }
        .react-calendar__tile--active.habit-day-all-complete,
        .react-calendar__tile--active.habit-day-all-missed,
        .react-calendar__tile--active.habit-day-partial-log {
          color: white !important; /* Override habit tile color for active day */
        }

        /* Scrollbar styling */
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
        .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 0.25rem; }
        .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 0.25rem; }
        .scrollbar-track-transparent::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
        .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

export default App;
