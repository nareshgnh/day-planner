//---version-2-firebase editrio----
// src/App.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

// Firebase Imports
import { db } from "./firebaseConfig"; // Adjust path if needed
import {
  collection,
  query,
  orderBy,
  onSnapshot, // For real-time updates
  doc,
  setDoc, // Used for add/update
  deleteDoc,
  updateDoc,
  deleteField, // Used to remove a field from a document
  getDocs, // Needed for cleaning up logs on habit delete (optional improvement)
} from "firebase/firestore";

// Hooks
import { useDarkMode } from "./hooks/useDarkMode"; // Adjust path if needed

// Components
import { Header } from "./components/Header"; // Adjust path if needed
import { CalendarCard } from "./components/CalendarCard"; // Adjust path if needed
import { DailyLogCard } from "./components/DailyLogCard"; // Adjust path if needed
import { HabitAssistantCard } from "./components/HabitAssistantCard"; // Adjust path if needed
import { ManageHabitsCard } from "./components/ManageHabitsCard"; // Adjust path if needed
import { HabitModal } from "./components/HabitModal"; // Adjust path if needed
import { ChatPanel } from "./components/ChatPanel"; // Adjust path if needed
import { Button } from "./ui/Button"; // Adjust path if needed

// Utils & Constants
// Ensure these helpers use the updated local date logic
import { formatDate, parseDate } from "./utils/helpers"; // Adjust path if needed
import { fetchMotivationSuggestion, fetchChatResponse } from "./utils/api"; // Adjust path if needed
import * as Actions from "./constants"; // Import all constants, adjust path if needed

// Icons
import { MessageSquare } from "lucide-react";

// --- Firestore Collection References ---
const habitsCollectionRef = collection(db, "habits");
const habitLogCollectionRef = collection(db, "habitLog");
// ---

// --- Main App Component ---
function App() {
  // --- State Definitions ---
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitModalData, setHabitModalData] = useState({
    title: "",
    type: "good",
    startDate: formatDate(new Date()),
    endDate: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState(
    Actions.GEMINI_API_KEY ? "Loading suggestion..." : "AI features disabled."
  );
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(
    !!Actions.GEMINI_API_KEY
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingActionData, setPendingActionData] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [userName, setUserName] = useState("User");
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const chatInputRef = useRef(null);
  const [focusChatInput, setFocusChatInput] = useState(false);
  // FIX: Initialize isLoadingData to true
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Effects ---

  // Load Habits and Logs from Firestore on mount using REAL-TIME listeners
  useEffect(() => {
    console.log("Setting up Firestore listeners...");
    // No need to set isLoadingData(true) here, it's true initially

    let isInitialHabitsLoad = true; // Flag to track the first habits load

    // Listener for Habits collection, ordered by title
    const qHabits = query(habitsCollectionRef, orderBy("title"));
    const unsubscribeHabits = onSnapshot(
      qHabits,
      (querySnapshot) => {
        const habitsData = [];
        querySnapshot.forEach((doc) => {
          habitsData.push({ id: doc.id, ...doc.data() });
        });
        setHabits(habitsData);
        console.log("Habits loaded/updated from Firestore:", habitsData.length);
        // FIX: Only set loading false on the *very first* successful snapshot
        if (isInitialHabitsLoad) {
          setIsLoadingData(false);
          isInitialHabitsLoad = false; // Prevent setting it false on subsequent updates
        }
      },
      (error) => {
        console.error("Error listening to habits:", error);
        alert("Could not load habits from the database.");
        setIsLoadingData(false); // Stop loading on error too
      }
    );

    // Listener for Habit Log collection
    const qLogs = query(habitLogCollectionRef);
    const unsubscribeLogs = onSnapshot(
      qLogs,
      (querySnapshot) => {
        const logsData = {};
        querySnapshot.forEach((doc) => {
          logsData[doc.id] = doc.data();
        });
        setHabitLog(logsData);
        console.log(
          "Habit logs loaded/updated from Firestore:",
          Object.keys(logsData).length
        );
      },
      (error) => {
        console.error("Error listening to habit logs:", error);
        alert("Could not load habit logs from the database.");
        // Don't change isLoadingData here, rely on the habits listener
      }
    );

    // Cleanup function
    return () => {
      console.log("Unsubscribing Firestore listeners.");
      unsubscribeHabits();
      unsubscribeLogs();
    };
    // FIX: Changed dependency array to [] to run only once on mount
  }, []);

  // Fetch initial AI Suggestion
  useEffect(() => {
    if (!isLoadingData && Actions.GEMINI_API_KEY) {
      console.log("Data loaded, fetching initial motivation.");
      setIsLoadingSuggestion(true);
      setAiSuggestion("Getting suggestion...");
      const timer = setTimeout(() => {
        fetchMotivationSuggestion(habits, habitLog)
          .then(setAiSuggestion)
          .catch((err) => {
            console.error(err);
            setAiSuggestion("Failed to get suggestion.");
          })
          .finally(() => setIsLoadingSuggestion(false));
      }, 500);
      return () => clearTimeout(timer);
    } else if (!Actions.GEMINI_API_KEY) {
      setAiSuggestion("AI features disabled.");
      setIsLoadingSuggestion(false);
    }
  }, [isLoadingData, habits, habitLog]); // Re-run if loading state changes OR if habits/log data changes

  // --- Core Logic Callbacks (remain the same as previous Firestore version) ---
  const upsertHabit = useCallback(async (habitDataToSave) => {
    const habitId =
      habitDataToSave.id ||
      `habit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const habitDocRef = doc(db, "habits", habitId);
    const newHabitData = {
      title: (habitDataToSave.title || "").trim(),
      type: habitDataToSave.type === "bad" ? "bad" : "good",
      startDate: habitDataToSave.startDate || formatDate(new Date()),
      endDate: habitDataToSave.endDate || null,
    };
    if (!newHabitData.title) {
      alert("Habit title cannot be empty.");
      return false;
    }
    const startD = parseDate(newHabitData.startDate);
    const endD = newHabitData.endDate ? parseDate(newHabitData.endDate) : null;
    if (!startD || (newHabitData.endDate && !endD) || (endD && startD > endD)) {
      alert("Invalid date format or end date before start date.");
      return false;
    }
    console.log(`Saving habit ${habitId} to Firestore...`);
    try {
      await setDoc(habitDocRef, newHabitData, { merge: true });
      console.log("Habit saved successfully:", habitId);
      return true;
    } catch (error) {
      console.error("Error saving habit:", error);
      alert("Failed to save habit.");
      return false;
    }
  }, []);

  const handleDeleteHabitCallback = useCallback(
    async (id) => {
      if (!id) return;
      const habitTitle = habits.find((h) => h.id === id)?.title || id;
      console.log(`Deleting habit ${id} (${habitTitle}) from Firestore...`);
      const habitDocRef = doc(db, "habits", id);
      try {
        await deleteDoc(habitDocRef);
        console.log("Habit document deleted successfully:", id);
        console.warn(`Habit logs for ${id} were not automatically deleted.`);
      } catch (error) {
        console.error("Error deleting habit:", error);
        alert("Failed to delete habit.");
      }
    },
    [habits]
  );

  const setHabitCompletionStatus = useCallback(
    async (habitId, date, desiredStatus) => {
      const dateStr = formatDate(date);
      if (!dateStr || !habitId) return;
      const logDocRef = doc(db, "habitLog", dateStr);
      try {
        const currentDayLog = habitLog[dateStr] || {};
        const currentStatus = currentDayLog[habitId];
        if (currentStatus === desiredStatus) {
          await updateDoc(logDocRef, { [habitId]: deleteField() });
        } else {
          await setDoc(
            logDocRef,
            { [habitId]: desiredStatus },
            { merge: true }
          );
        }
      } catch (error) {
        if (!(error.code === "not-found" && currentStatus === desiredStatus)) {
          // Avoid alert if deleting non-existent field
          console.error("Error updating habit log:", error);
          alert("Failed to update habit status.");
        } else {
          console.log(
            `Log field for habit ${habitId} on ${dateStr} likely already removed.`
          );
        }
      }
    },
    [habitLog]
  );

  const findHabitIdByTitle = useCallback(
    (title) => {
      if (!title || !Array.isArray(habits)) return null;
      const searchTerm = title.trim().toLowerCase();
      if (!searchTerm) return null;
      const exactMatch = habits.find(
        (h) => h.title.trim().toLowerCase() === searchTerm
      );
      return exactMatch ? exactMatch.id : null;
    },
    [habits]
  );

  // --- Modal Handling Callbacks ---
  const openModalForNewHabit = useCallback(() => {
    setEditingHabit(null);
    setHabitModalData({
      title: "",
      type: "good",
      startDate: formatDate(new Date()),
      endDate: "",
    });
    setIsHabitModalOpen(true);
  }, []);

  const openModalForEditHabit = useCallback((habit) => {
    setEditingHabit(habit);
    setHabitModalData({
      title: habit.title,
      type: habit.type || "good",
      startDate: habit.startDate,
      endDate: habit.endDate || "",
    });
    setIsHabitModalOpen(true);
  }, []);

  const closeHabitModal = useCallback(() => {
    setIsHabitModalOpen(false);
    setEditingHabit(null);
    setHabitModalData({
      title: "",
      type: "good",
      startDate: formatDate(new Date()),
      endDate: "",
    });
  }, []);

  const handleHabitModalSave = useCallback(async () => {
    if (!habitModalData.title.trim()) {
      alert("Habit title required.");
      return;
    }
    const success = await upsertHabit({
      id: editingHabit?.id,
      ...habitModalData,
      endDate: habitModalData.endDate || null,
    });
    if (success) closeHabitModal();
  }, [upsertHabit, editingHabit, habitModalData, closeHabitModal]);

  // --- Chat Handling Callbacks ---
  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) {
      setTimeout(() => setFocusChatInput(true), 350);
    }
  }, [isChatOpen]);

  const handleSendChatMessage = useCallback(async () => {
    const messageText = chatInput.trim();
    const lowerCaseMessage = messageText.toLowerCase();

    if (!messageText && !awaitingConfirmation) return;
    if (isChatLoading && !awaitingConfirmation) {
      console.log("Chat busy.");
      return;
    }

    const newUserMessage = { sender: "user", text: messageText };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput(""); // Clear input immediately

    // Confirmation Flow
    if (awaitingConfirmation && pendingActionData) {
      console.log("Processing confirmation...");
      try {
        const userConfirmation = lowerCaseMessage;
        let confirmationResponseText = "";
        let performAction = false;

        if (userConfirmation === "yes" || userConfirmation === "y")
          performAction = true;
        else if (userConfirmation === "no" || userConfirmation === "n")
          confirmationResponseText = "Okay, action cancelled.";
        else
          confirmationResponseText = `Please confirm with 'yes' or 'no'. ${pendingActionData.confirmationPrompt}`;

        if (performAction) {
          try {
            console.log(
              "Performing confirmed action:",
              pendingActionData.action
            );
            switch (pendingActionData.action) {
              case Actions.ACTION_DELETE_HABIT:
                await Promise.all(
                  pendingActionData.habitIds?.map((id) =>
                    handleDeleteHabitCallback(id)
                  ) || []
                );
                confirmationResponseText = `Okay, deleted habit "${pendingActionData.title}".`;
                break;
              case Actions.ACTION_SUGGEST_HABITS:
                const results = await Promise.all(
                  pendingActionData.habits?.map((h) => upsertHabit(h)) || []
                );
                const addedCount = results.filter((success) => success).length;
                confirmationResponseText = `Okay, added ${addedCount} suggested habit(s).`;
                break;
              case Actions.ACTION_DELETE_ALL_HABITS:
                console.warn(
                  "Delete All Habits from Firestore not fully implemented yet."
                );
                setHabits([]);
                setHabitLog({});
                confirmationResponseText =
                  "Okay, cleared local habits (Firestore deletion pending implementation).";
                break;
              case Actions.ACTION_COMPLETE_ALL_HABITS_TODAY:
                const today = new Date();
                const todayStr = formatDate(today);
                const activeToday = habits.filter((h) => {
                  try {
                    const s = parseDate(h.startDate),
                      e = h.endDate ? parseDate(h.endDate) : null,
                      t = parseDate(todayStr);
                    return s && t && t >= s && (!e || t <= e);
                  } catch {
                    return false;
                  }
                });
                if (activeToday.length > 0) {
                  await Promise.all(
                    activeToday.map((h) =>
                      setHabitCompletionStatus(h.id, today, true)
                    )
                  );
                  confirmationResponseText = `Okay, marked all ${activeToday.length} active habits for today as complete/avoided.`;
                } else
                  confirmationResponseText = "No habits were active today.";
                break;
              default:
                confirmationResponseText = "Action confirmed (unknown).";
            }
          } catch (error) {
            console.error("Error performing action:", error);
            confirmationResponseText = "Error performing action.";
          }
        }

        if (confirmationResponseText)
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: confirmationResponseText },
          ]);
        if (
          performAction ||
          lowerCaseMessage === "no" ||
          lowerCaseMessage === "n"
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
        setTimeout(() => setFocusChatInput(true), 0);
      }
      return;
    }

    // Regular Message / New Action Request
    setIsChatLoading(true);
    try {
      const currentChatHistory = [...chatHistory, newUserMessage];
      const botResponse = await fetchChatResponse(
        habits,
        habitLog,
        currentChatHistory,
        messageText,
        userName
      );

      let requiresConfirmation = false;
      let confirmationPrompt = "";
      let chatMessageToAdd = "";
      let actionDataForConfirmation = null;

      if (!botResponse || (!botResponse.action && !botResponse.text)) {
        chatMessageToAdd = "Sorry, invalid AI response.";
      } else if (
        botResponse.action &&
        botResponse.action !== Actions.ACTION_GENERAL_CHAT
      ) {
        actionDataForConfirmation = {
          action: botResponse.action,
          confirmationPrompt: "",
        };
        try {
          switch (botResponse.action) {
            case Actions.ACTION_ADD_HABIT:
              if (
                await upsertHabit({
                  title: botResponse.title,
                  type: botResponse.type,
                  startDate: botResponse.startDate,
                  endDate: botResponse.endDate,
                })
              )
                chatMessageToAdd = `Okay, added habit "${botResponse.title}".`;
              else
                chatMessageToAdd = `Could not add habit "${botResponse.title}". Duplicate or invalid dates?`;
              break;
            case Actions.ACTION_BATCH_ACTIONS:
              if (Array.isArray(botResponse.actions)) {
                let added = 0,
                  failed = [],
                  dups = [];
                await Promise.all(
                  botResponse.actions.map(async (action) => {
                    if (
                      action.action === Actions.ACTION_ADD_HABIT &&
                      action.title
                    ) {
                      if (
                        habits.some(
                          (h) =>
                            h.title.toLowerCase() === action.title.toLowerCase()
                        )
                      )
                        dups.push(action.title);
                      else if (await upsertHabit(action)) added++;
                      else failed.push(action.title);
                    } else if (action.title) failed.push(action.title);
                  })
                );
                let msgs = [];
                if (added > 0) msgs.push(`Added ${added} habits.`);
                if (dups.length > 0)
                  msgs.push(`Skipped duplicates: ${dups.join(", ")}.`);
                if (failed.length > 0)
                  msgs.push(`Failed (invalid?): ${failed.join(", ")}.`);
                chatMessageToAdd =
                  msgs.length > 0
                    ? msgs.join(" ")
                    : "Couldn't process batch add.";
              } else chatMessageToAdd = "Invalid batch action format.";
              break;
            case Actions.ACTION_DELETE_HABIT:
              const idDel = findHabitIdByTitle(botResponse.title);
              if (idDel) {
                requiresConfirmation = true;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  habitIds: [idDel],
                  title: botResponse.title,
                  confirmationPrompt: `Delete habit "${botResponse.title}" and logs? (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt;
              } else
                chatMessageToAdd = `Couldn't find habit "${botResponse.title}". Check title.`;
              break;
            case Actions.ACTION_COMPLETE_HABIT_DATE:
              const idLog = findHabitIdByTitle(botResponse.title);
              const dateLogStr = botResponse.date || formatDate(new Date());
              const statusLog = botResponse.status;
              const dateLog = parseDate(dateLogStr);
              if (idLog && dateLog && statusLog !== null) {
                const habitInfo = habits.find((h) => h.id === idLog);
                await setHabitCompletionStatus(idLog, dateLog, statusLog);
                const statusTxt = statusLog
                  ? habitInfo?.type === "bad"
                    ? "avoided"
                    : "done"
                  : habitInfo?.type === "bad"
                  ? "indulged"
                  : "missed";
                chatMessageToAdd = `Okay, marked "${botResponse.title}" as ${statusTxt} for ${dateLogStr}.`;
              } else
                chatMessageToAdd = `Couldn't log "${botResponse.title}". Check title/date (YYYY-MM-DD).`;
              break;
            case Actions.ACTION_SUGGEST_HABITS:
              if (
                Array.isArray(botResponse.habits) &&
                botResponse.habits.length > 0
              ) {
                const valid = botResponse.habits.filter((h) => h && h.title);
                if (valid.length > 0) {
                  requiresConfirmation = true;
                  const titles = valid.map((h) => `"${h.title}"`).join(", ");
                  actionDataForConfirmation = {
                    ...actionDataForConfirmation,
                    habits: valid,
                    confirmationPrompt: `AI suggests adding: ${titles}. Add them? (yes/no)`,
                  };
                  confirmationPrompt =
                    actionDataForConfirmation.confirmationPrompt;
                } else chatMessageToAdd = "AI suggestions seem invalid.";
              } else chatMessageToAdd = "AI couldn't suggest habits.";
              break;
            case Actions.ACTION_DELETE_ALL_HABITS:
              if (habits.length > 0) {
                requiresConfirmation = true;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt: `Delete all ${habits.length} habits and logs? Cannot be undone. (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt;
              } else chatMessageToAdd = "No habits to delete.";
              break;
            case Actions.ACTION_COMPLETE_ALL_HABITS_TODAY:
              const todayComp = new Date();
              const todayCompStr = formatDate(todayComp);
              const activeComp = habits.filter((h) => {
                try {
                  const s = parseDate(h.startDate),
                    e = h.endDate ? parseDate(h.endDate) : null,
                    t = parseDate(todayCompStr);
                  return s && t && t >= s && (!e || t <= e);
                } catch {
                  return false;
                }
              });
              if (activeComp.length > 0) {
                requiresConfirmation = true;
                actionDataForConfirmation = {
                  ...actionDataForConfirmation,
                  confirmationPrompt: `Mark all ${activeComp.length} active habits today as done/avoided? (yes/no)`,
                };
                confirmationPrompt =
                  actionDataForConfirmation.confirmationPrompt;
              } else chatMessageToAdd = "No habits active today.";
              break;
            default:
              chatMessageToAdd = "Unknown action request.";
              console.warn("Unknown action:", botResponse.action);
          }
        } catch (actionError) {
          console.error(
            `Error processing action ${botResponse.action}:`,
            actionError
          );
          chatMessageToAdd = `Error processing action: ${botResponse.action}.`;
          requiresConfirmation = false;
        }
      } else {
        chatMessageToAdd = botResponse.text || "Sorry, I didn't understand.";
        // Name detection logic...
        const nameKeywords = ["my name is ", "i'm ", "im ", "call me "];
        const keywordFound = nameKeywords.find((kw) =>
          lowerCaseMessage.startsWith(kw)
        );
        if (keywordFound) {
          const potentialName = messageText
            .substring(keywordFound.length)
            .trim()
            .replace(/[^a-zA-Z\s-]/g, "")
            .trim();
          if (
            potentialName &&
            potentialName.length >= 2 &&
            potentialName.length <= 30
          ) {
            const formattedName = potentialName
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            setUserName(formattedName);
            chatMessageToAdd = `Nice to meet you, ${formattedName}! How can I help?`;
          }
        }
      }

      if (
        requiresConfirmation &&
        actionDataForConfirmation?.confirmationPrompt
      ) {
        setPendingActionData(actionDataForConfirmation);
        setAwaitingConfirmation(true);
        chatMessageToAdd = confirmationPrompt;
      }

      if (chatMessageToAdd)
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: chatMessageToAdd },
        ]);
      else if (!requiresConfirmation)
        console.warn("No message generated:", botResponse);

      // Close chat on farewell
      const farewells = ["bye", "goodbye", "exit", "close chat", "close"];
      if (farewells.includes(lowerCaseMessage)) {
        console.log("User said bye, closing chat.");
        setTimeout(toggleChat, 1000);
      }
    } catch (error) {
      console.error("Critical Error in handleSendChatMessage:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Critical error processing request." },
      ]);
      setPendingActionData(null);
      setAwaitingConfirmation(false);
    } finally {
      setIsChatLoading(false);
      const farewells = ["bye", "goodbye", "exit", "close chat", "close"];
      const shouldClose = farewells.includes(lowerCaseMessage);

      // Trigger focus via state, unless closing or awaiting confirmation
      if (!awaitingConfirmation && !shouldClose) {
        setTimeout(() => setFocusChatInput(true), 0);
      }
    }
  }, [
    chatInput,
    chatHistory,
    habits,
    habitLog,
    isChatLoading,
    awaitingConfirmation,
    pendingActionData,
    userName,
    upsertHabit,
    findHabitIdByTitle,
    handleDeleteHabitCallback,
    setHabitCompletionStatus,
    setUserName,
    setHabits,
    setHabitLog,
    toggleChat,
    setChatInput,
  ]);

  // --- Voice Input Logic ---
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setIsListening(true);
      setChatInput("Listening...");
    };
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      setChatInput(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      let errorMsg = `Speech error: ${event.error}`;
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      )
        errorMsg = "Mic permission denied.";
      else if (event.error === "no-speech") errorMsg = "No speech detected.";
      else if (event.error === "audio-capture") errorMsg = "Mic error.";
      else if (event.error === "network")
        errorMsg = "Network error during speech recognition.";
      setChatHistory((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      setIsListening(false);
      if (chatInputRef.current?.value === "Listening...") setChatInput("");
    };
    recognition.onend = () => {
      setIsListening(false);
      if (chatInputRef.current?.value === "Listening...") setChatInput("");
      chatInputRef.current?.focus();
    };
    recognitionRef.current = recognition;
  }, [setChatHistory, setChatInput]);

  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      recognitionRef.current?.abort();
    };
  }, [setupSpeechRecognition]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Speech recognition not available." },
      ]);
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          setChatInput("");
          recognitionRef.current.start();
        })
        .catch((err) => {
          let errorText = "Could not start voice input.";
          if (err.name === "NotAllowedError") errorText = "Mic access denied.";
          else if (err.name === "NotFoundError") errorText = "No mic found.";
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", text: errorText },
          ]);
          setIsListening(false);
        });
    }
  };

  // --- Memoized Values ---
  const activeHabitsForSelectedDate = useMemo(() => {
    try {
      const selectedDateStr = formatDate(selectedDate);
      if (!selectedDateStr || !Array.isArray(habits)) return [];
      const selectedD = parseDate(selectedDateStr);
      if (!selectedD) return [];
      return habits.filter((h) => {
        if (!h?.startDate) return false;
        const startD = parseDate(h.startDate);
        const endD = h.endDate ? parseDate(h.endDate) : null;
        if (!startD || (h.endDate && !endD)) return false;
        selectedD.setHours(0, 0, 0, 0);
        startD.setHours(0, 0, 0, 0);
        if (endD) endD.setHours(0, 0, 0, 0); // Compare dates only
        return selectedD >= startD && (!endD || selectedD <= endD);
      });
    } catch (error) {
      console.error("Error calculating active habits:", error);
      return [];
    }
  }, [habits, selectedDate]);

  // --- Calendar Tile Styling Callback ---
  const getTileClassName = useCallback(
    ({ date, view }) => {
      if (view !== "month") return null;
      try {
        const dateStr = formatDate(date);
        if (!dateStr) return null;
        const logForDay = habitLog?.[dateStr];
        const tileDate = parseDate(dateStr);
        if (!tileDate) return null;
        const habitsForDay = habits.filter((h) => {
          if (!h?.startDate) return false;
          const s = parseDate(h.startDate),
            e = h.endDate ? parseDate(h.endDate) : null;
          if (!s || (h.endDate && !e)) return false;
          tileDate.setHours(0, 0, 0, 0);
          s.setHours(0, 0, 0, 0);
          if (e) e.setHours(0, 0, 0, 0); // Compare dates only
          return tileDate >= s && (!e || tileDate <= e);
        });
        if (habitsForDay.length === 0) return null;
        if (!logForDay || Object.keys(logForDay).length === 0)
          return "habit-day-pending";
        const completed = habitsForDay.filter(
          (h) => logForDay[h.id] === true
        ).length;
        const missed = habitsForDay.filter(
          (h) => logForDay[h.id] === false
        ).length;
        const logged = completed + missed;
        const allLogged = habitsForDay.every(
          (h) => logForDay[h.id] !== undefined
        );

        if (logged === 0) return "habit-day-pending";
        if (completed === habitsForDay.length) return "habit-day-all-complete";
        if (missed > 0 && completed === 0 && allLogged)
          return "habit-day-all-missed";
        if (logged > 0) return "habit-day-partial-log";
        return null;
      } catch (error) {
        console.error("Error in getTileClassName:", error);
        return null;
      }
    },
    [habits, habitLog]
  );

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
      <Header
        userName={userName}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isChatOpen={isChatOpen}
      />

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-2 md:py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-24">
        {isLoadingData && (
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
            <p className="text-lg font-semibold animate-pulse dark:text-white">
              Loading Data...
            </p>
          </div>
        )}
        <div className="lg:col-span-1 space-y-4 md:space-y-6 flex flex-col">
          <CalendarCard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getTileClassName={getTileClassName}
          />
          <DailyLogCard
            selectedDate={selectedDate}
            activeHabitsForSelectedDate={activeHabitsForSelectedDate}
            habitLog={habitLog}
            setHabitCompletionStatus={setHabitCompletionStatus}
          />
        </div>
        <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
          <HabitAssistantCard
            aiSuggestion={aiSuggestion}
            isLoadingSuggestion={isLoadingSuggestion}
            openModalForNewHabit={openModalForNewHabit}
          />
          <ManageHabitsCard
            habits={habits}
            openModalForEditHabit={openModalForEditHabit}
            handleDeleteHabitCallback={handleDeleteHabitCallback}
          />
        </div>
        {!isChatOpen && (
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition-transform hover:scale-110 flex items-center justify-center"
            aria-label="Open Chat Assistant"
          >
            <MessageSquare size={24} />
          </Button>
        )}
      </main>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={toggleChat}
        chatHistory={chatHistory}
        isChatLoading={isChatLoading}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendChatMessage={handleSendChatMessage}
        handleMicClick={handleMicClick}
        isListening={isListening}
        awaitingConfirmation={awaitingConfirmation}
        chatInputRef={chatInputRef}
        focusChatInput={focusChatInput}
        setFocusChatInput={setFocusChatInput}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={closeHabitModal}
        editingHabit={editingHabit}
        habitData={habitModalData}
        onDataChange={setHabitModalData}
        onSave={handleHabitModalSave}
      />

      <style>{`
        /* Styles remain the same */
        .react-calendar-wrapper { max-width: 100%; padding: 0; }
        .react-calendar { width: 100% !important; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: transparent; font-family: inherit; line-height: 1.5; }
        .dark .react-calendar { border-color: #374151; }
        .react-calendar__navigation { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em; padding: 0.25em 0.5em; }
        .react-calendar__navigation button { min-width: 40px; background: none; border: none; padding: 0.5em; border-radius: 0.375rem; font-weight: 600; color: #374151; cursor: pointer; transition: background-color 0.2s; }
        .dark .react-calendar__navigation button { color: #d1d5db; }
        .react-calendar__navigation button:disabled { opacity: 0.5; cursor: not-allowed; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; }
        .dark .react-calendar__navigation button:enabled:hover, .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; }
        .react-calendar__navigation__label { font-weight: bold; font-size: 0.9em; flex-grow: 0 !important; }
        .dark .react-calendar__navigation__label { color: #e5e7eb; }
        .react-calendar__month-view__weekdays { text-align: center; font-weight: bold; color: #6b7280; }
        .dark .react-calendar__month-view__weekdays abbr { color: #9ca3af; text-decoration: none !important; }
        .react-calendar__month-view__weekdays__weekday { padding: 0.5em; }
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; cursor: default; }
        .react-calendar__tile { border-radius: 0.375rem; transition: background-color 0.2s, border-color 0.2s, color 0.2s; padding: 0.5em 0.5em; line-height: 1.2; border: 1px solid transparent; text-align: center; cursor: pointer; font-size: 0.85em; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
        .react-calendar__month-view__days__day { color: #1f2937; }
        .dark .react-calendar__month-view__days__day { color: #e5e7eb; }
        .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; opacity: 0.7; }
        .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; opacity: 0.7; }
        .react-calendar__tile:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: 0.5; }
        .dark .react-calendar__tile:disabled { background-color: #1f2937; color: #6b7280; opacity: 0.5; }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #e5e7eb; }
        .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus { background-color: #374151; }
        .react-calendar__tile--now { background: #dbeafe !important; font-weight: bold; border: 1px solid #bfdbfe !important; }
        .dark .react-calendar__tile--now { background: #1e3a8a !important; border-color: #3b82f6 !important; color: white !important; }
        .react-calendar__tile--active { background: #60a5fa !important; color: white !important; }
        .dark .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
        .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; }
        .dark .react-calendar__tile--active:enabled:hover, .dark .react-calendar__tile--active:enabled:focus { background: #2563eb !important; }
        .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; }
        .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }
        .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; }
        .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }
        .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; }
        .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }
        .habit-day-pending { border-color: #d1d5db !important; }
        .dark .habit-day-pending { border-color: #4b5563 !important; }
        .react-calendar__tile--active.habit-day-all-complete, .react-calendar__tile--active.habit-day-all-missed, .react-calendar__tile--active.habit-day-partial-log, .react-calendar__tile--active.habit-day-pending { color: white !important; }
        .dark .react-calendar__tile--active.habit-day-all-complete, .dark .react-calendar__tile--active.habit-day-all-missed, .dark .react-calendar__tile--active.habit-day-partial-log, .dark .react-calendar__tile--active.habit-day-pending { color: white !important; }
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
        .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; border: 1px solid transparent; }
        .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; }
        ::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }
        .dark ::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
        .prose p:first-child, .prose p:last-child { margin-top: 0; margin-bottom: 0; }
        .dark .prose-invert { --tw-prose-body: #d1d5db; --tw-prose-headings: #fff; }
      `}</style>
    </div>
  );
}

export default App;
