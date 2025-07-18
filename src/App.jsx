// src/App.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

// Firebase Imports
import { db, auth } from "./firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Hooks
import { useDarkMode } from "./hooks/useDarkMode";

// Components
import { Header } from "./components/Header";
import { HabitModal } from "./components/HabitModal";
import { ChatPanel } from "./components/ChatPanel";
import { BottomNavigation } from "./components/BottomNavigation";
import { Button } from "./ui/Button";

// Pages
import DashboardPage from "./pages/DashboardPage";
import ManageHabitsPage from "./pages/ManageHabitsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import StreaksPage from "./pages/StreaksPage";
import LoginPage from "./pages/LoginPage";

// Utils & Constants
import {
  formatDate,
  parseDate,
  isHabitScheduledForDate,
} from "./utils/helpers";
import { fetchChatResponse } from "./utils/api";
import * as Actions from "./constants";

// Icons
import {
  MessageSquare,
  LayoutDashboard,
  ListChecks,
  LineChart,
  Settings as SettingsIcon,
  Flame,
} from "lucide-react";

const habitsCollectionRef = collection(db, "habits");
const habitLogCollectionRef = collection(db, "habitLog");

const initialHabitModalData = {
  title: "",
  type: "good",
  startDate: formatDate(new Date()),
  endDate: "",
  scheduleType: "daily",
  scheduleDays: [],
  scheduleFrequency: null,
  isMeasurable: false,
  unit: "",
  goal: null,
  category: "",
};

function App() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitModalData, setHabitModalData] = useState(initialHabitModalData);
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Authentication state listener
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        console.log("User authenticated:", currentUser.uid);
        // If user is authenticated, set their name
        if (currentUser.displayName) {
          setUserName(currentUser.displayName);
        }
      } else {
        console.log("User not authenticated");
        // Don't redirect here - let the routing handle it
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Data loading effect - only runs when user is authenticated
  useEffect(() => {
    if (!user) return; // Don't load data if user is not authenticated

    setIsLoadingData(true);
    let isInitial = true;
    const qH = query(habitsCollectionRef, orderBy("title"));
    const unH = onSnapshot(
      qH,
      (qs) => {
        const d = qs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHabits(d);
        if (isInitial) {
          setIsLoadingData(false);
          isInitial = false;
        }
      },
      (e) => {
        console.error("Habits listener err:", e);
        setIsLoadingData(false);
      }
    );
    const qL = query(habitLogCollectionRef);
    const unL = onSnapshot(
      qL,
      (qs) => {
        const d = {};
        qs.forEach((doc) => (d[doc.id] = doc.data()));
        setHabitLog(d);
      },
      (e) => console.error("Logs listener err:", e)
    );
    return () => {
      unH();
      unL();
    };
  }, [user]); // Add user as a dependency

  useEffect(() => {
    if ("Notification" in window)
      setNotificationPermission(Notification.permission);
    else {
      console.warn("Notifications not supported.");
      setNotificationPermission("denied");
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Notifications not supported.");
      setNotificationPermission("denied");
      return;
    }
    if (
      notificationPermission === "granted" ||
      notificationPermission === "denied"
    )
      return;
    const p = await Notification.requestPermission();
    setNotificationPermission(p);
    if (p === "granted")
      new Notification("Habit Tracker AI", {
        body: "Notifications enabled!",
        icon: "/vite.svg",
      });
    else alert("Notifications denied.");
  }, [notificationPermission]);

  const upsertHabit = useCallback(async (habitDataToSave) => {
    const habitId =
      habitDataToSave.id ||
      `habit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const habitDocRef = doc(db, "habits", habitId);
    const isMeasurable = habitDataToSave.isMeasurable || false;
    const scheduleType = habitDataToSave.scheduleType || "daily";
    const trimmedCategory = habitDataToSave.category?.trim() || null;

    const newHabitData = {
      title: (habitDataToSave.title || "").trim(),
      type: habitDataToSave.type === "bad" ? "bad" : "good",
      startDate: habitDataToSave.startDate || formatDate(new Date()),
      endDate: habitDataToSave.endDate || null,
      category: trimmedCategory,
      isMeasurable: isMeasurable,
      unit: isMeasurable ? (habitDataToSave.unit || "").trim() : deleteField(),
      goal: isMeasurable ? habitDataToSave.goal || null : deleteField(),
      scheduleType: scheduleType === "daily" ? deleteField() : scheduleType,
      scheduleDays:
        scheduleType === "specific_days"
          ? (habitDataToSave.scheduleDays || []).sort((a, b) => a - b)
          : deleteField(),
      scheduleFrequency:
        scheduleType === "frequency_weekly"
          ? habitDataToSave.scheduleFrequency || null
          : deleteField(),
    };

    // Form validation without alerts
    if (!newHabitData.title) {
      console.log("Validation error: Habit title required.");
      return false;
    }
    const startD = parseDate(newHabitData.startDate);
    const endD = newHabitData.endDate ? parseDate(newHabitData.endDate) : null;
    if (!startD || (newHabitData.endDate && !endD) || (endD && startD > endD)) {
      console.log("Validation error: Invalid date range.");
      return false;
    }
    if (
      scheduleType === "specific_days" &&
      (!newHabitData.scheduleDays || newHabitData.scheduleDays.length === 0)
    ) {
      console.log("Validation error: Select days for 'Specific Days'.");
      return false;
    }
    if (
      scheduleType === "frequency_weekly" &&
      (newHabitData.scheduleFrequency === null ||
        newHabitData.scheduleFrequency <= 0)
    ) {
      console.log("Validation error: Enter valid frequency.");
      return false;
    }
    if (isMeasurable && newHabitData.unit === undefined) {
      if (!habitDataToSave.unit || !habitDataToSave.unit.trim()) {
        console.log("Validation error: Unit required for measurable habits.");
        return false;
      }
      newHabitData.unit = habitDataToSave.unit.trim();
    }
    if (
      isMeasurable &&
      (newHabitData.goal === null ||
        newHabitData.goal === undefined ||
        newHabitData.goal <= 0)
    ) {
      if (
        habitDataToSave.goal === null ||
        habitDataToSave.goal === undefined ||
        habitDataToSave.goal <= 0
      ) {
        console.log(
          "Validation error: Valid goal (> 0) required for measurable habits."
        );
        return false;
      }
      newHabitData.goal = habitDataToSave.goal;
    }

    const finalHabitData = Object.entries(newHabitData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      },
      {}
    );

    try {
      await setDoc(habitDocRef, finalHabitData, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving habit:", error);
      // Remove alert to avoid blocking the UI flow
      return false;
    }
  }, []);

  const handleDeleteHabitCallback = useCallback(
    async (id) => {
      if (!id) return;

      // Find the habit name for the notification
      const habit = habits.find((h) => h.id === id);
      const habitName = habit?.title || "Habit";

      const dR = doc(db, "habits", id);
      try {
        await deleteDoc(dR);
        console.log(`"${habitName}" deleted successfully!`);
      } catch (e) {
        console.error("Failed to delete habit:", e);
      }
    },
    [habits]
  );

  const updateHabitLog = useCallback(async (habitId, date, value) => {
    const dateStr = formatDate(date);
    if (!dateStr || !habitId) {
      console.error("Invalid args for updateHabitLog", {
        habitId,
        dateStr,
        value,
      });
      return;
    }
    const logDocRef = doc(db, "habitLog", dateStr);
    const logData = { [habitId]: value };
    try {
      if (value === null || value === undefined)
        await updateDoc(logDocRef, { [habitId]: deleteField() });
      else await setDoc(logDocRef, logData, { merge: true });
    } catch (error) {
      if (
        !(error.code === "not-found" && (value === null || value === undefined))
      ) {
        console.error("[updateHabitLog] Error:", error);
        alert("Failed to update habit log.");
      }
    }
  }, []);

  const findHabitIdByTitle = useCallback(
    (title) => {
      if (!title || !Array.isArray(habits)) return null;
      const s = title.trim().toLowerCase();
      if (!s) return null;
      const m = habits.find((h) => h.title.trim().toLowerCase() === s);
      return m ? m.id : null;
    },
    [habits]
  );

  const openModalForNewHabit = useCallback(() => {
    setEditingHabit(null);
    setHabitModalData(initialHabitModalData);
    setIsHabitModalOpen(true);
  }, []);

  const openModalForEditHabit = useCallback((habit) => {
    setEditingHabit(habit);
    setHabitModalData({
      title: habit.title || "",
      type: habit.type || "good",
      startDate: habit.startDate || formatDate(new Date()),
      endDate: habit.endDate || "",
      scheduleType: habit.scheduleType || "daily",
      scheduleDays: habit.scheduleDays || [],
      scheduleFrequency: habit.scheduleFrequency ?? null,
      isMeasurable: habit.isMeasurable || false,
      unit: habit.unit || "",
      goal: habit.goal ?? null,
      category: habit.category || "",
    });
    setIsHabitModalOpen(true);
  }, []);

  const closeHabitModal = useCallback(() => {
    setIsHabitModalOpen(false);
    setEditingHabit(null);
    setHabitModalData(initialHabitModalData);
  }, []);

  const handleHabitModalSave = useCallback(async () => {
    try {
      // Close modal first to improve perceived performance
      const habitToSave = {
        id: editingHabit?.id,
        ...habitModalData,
      };

      const habitName = habitModalData.title || "Habit";
      const isEditing = !!editingHabit;
      const successMessage = isEditing
        ? `"${habitName}" updated successfully! 🎉`
        : `"${habitName}" added successfully! 🎉`;

      // Close modal immediately
      closeHabitModal();

      // Then save the habit
      const success = await upsertHabit(habitToSave);

      if (success) {
        console.log("Habit saved successfully:", successMessage);
      } else {
        console.log("Failed to save habit");
      }
    } catch (error) {
      console.error("Error in handleHabitModalSave:", error);
    }
  }, [upsertHabit, editingHabit, habitModalData, closeHabitModal]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((p) => !p);
    if (!isChatOpen) setTimeout(() => setFocusChatInput(true), 350);
  }, [isChatOpen]);

  const handleSendChatMessage = useCallback(async () => {
    const msgTxt = chatInput.trim();
    const lowerMsg = msgTxt.toLowerCase();
    if (!msgTxt && !awaitingConfirmation) return;
    if (isChatLoading && !awaitingConfirmation) return;
    const userMsg = { sender: "user", text: msgTxt };
    setChatHistory((p) => [...p, userMsg]);
    setChatInput("");
    if (awaitingConfirmation && pendingActionData) {
      try {
        const c = lowerMsg;
        let r = "";
        let d = false;
        if (c === "yes" || c === "y") d = true;
        else if (c === "no" || c === "n") r = "Cancelled.";
        else r = `Confirm yes/no. ${pendingActionData.confirmationPrompt}`;
        if (d) {
          try {
            switch (pendingActionData.action) {
              case Actions.ACTION_DELETE_HABIT:
                await Promise.all(
                  pendingActionData.habitIds?.map((id) =>
                    handleDeleteHabitCallback(id)
                  ) || []
                );
                r = `Deleted "${pendingActionData.title || "habit"}".`;
                break;
              case Actions.ACTION_SUGGEST_HABITS:
                const rs = await Promise.all(
                  pendingActionData.habits?.map((h) => upsertHabit(h)) || []
                );
                r = `Added ${rs.filter((s) => s).length} suggested habits.`;
                break;
              case Actions.ACTION_DELETE_ALL_HABITS:
                try {
                  const q = query(habitsCollectionRef);
                  const qs = await getDocs(q);
                  const batch = writeBatch(db);
                  qs.docs.forEach((docSnapshot) =>
                    batch.delete(docSnapshot.ref)
                  );
                  const logDocsSnapshot = await getDocs(
                    collection(db, "habitLog")
                  );
                  logDocsSnapshot.forEach((logDoc) => batch.delete(logDoc.ref));
                  await batch.commit();
                  setHabits([]);
                  setHabitLog({});
                  r = `Deleted all ${qs.size} habits and their logs.`;
                } catch (e) {
                  r = "Error deleting all habits.";
                  console.error(e);
                }
                break;
              case Actions.ACTION_COMPLETE_ALL_HABITS_TODAY:
                const t = new Date();
                const aNM = habits.filter(
                  (h) => !h.isMeasurable && isHabitScheduledForDate(h, t)
                );
                if (aNM.length > 0) {
                  await Promise.all(
                    aNM.map((h) => updateHabitLog(h.id, t, true))
                  );
                  r = `Marked ${aNM.length} non-measurable habits as done for today.`;
                } else r = "No non-measurable habits scheduled for today.";
                break;
              default:
                r = "Confirmed (unknown action).";
            }
          } catch (e) {
            r = "Error performing confirmed action.";
            console.error(e);
          }
        }
        if (r) {
          console.log("[App.jsx] AI Confirmation/Action Response:", r);
          setChatHistory((p) => [...p, { sender: "bot", text: r }]);
        }
        if (d || c === "no" || c === "n") {
          setPendingActionData(null);
          setAwaitingConfirmation(false);
        } else {
          setAwaitingConfirmation(true);
        }
      } catch (e) {
        console.error(e);
        setChatHistory((p) => [
          ...p,
          { sender: "bot", text: "Confirmation processing error." },
        ]);
        setPendingActionData(null);
        setAwaitingConfirmation(false);
      } finally {
        if (!(lowerMsg === "no" || lowerMsg === "n"))
          setTimeout(() => setFocusChatInput(true), 0);
      }
      return;
    }
    setIsChatLoading(true);
    try {
      const cH = [...chatHistory];
      const bR = await fetchChatResponse(
        habits,
        habitLog,
        cH,
        msgTxt,
        userName
      );
      let rC = false;
      let cP = "";
      let cM = "";
      let aD = null;
      if (!bR || (!bR.action && !bR.text)) cM = "Invalid AI response.";
      else if (bR.action && bR.action !== Actions.ACTION_GENERAL_CHAT) {
        aD = { ...bR };
        try {
          switch (bR.action) {
            case Actions.ACTION_ADD_HABIT:
              const added = await upsertHabit(bR);
              cM = added
                ? `Added habit: "${bR.title}".`
                : `Could not add habit.`;
              break;
            case Actions.ACTION_BATCH_ACTIONS:
              if (Array.isArray(bR.actions)) {
                let ad = 0,
                  fa = [],
                  du = [];
                await Promise.all(
                  bR.actions.map(async (a) => {
                    if (a.action === Actions.ACTION_ADD_HABIT && a.title) {
                      if (
                        habits.some(
                          (h) => h.title.toLowerCase() === a.title.toLowerCase()
                        )
                      )
                        du.push(a.title);
                      else if (await upsertHabit(a)) ad++;
                      else fa.push(a.title);
                    } else if (a.title) fa.push(a.title);
                  })
                );
                let ms = [];
                if (ad > 0) ms.push(`Added ${ad} habits.`);
                if (du.length > 0)
                  ms.push(`Duplicate habits not added: ${du.join(", ")}.`);
                if (fa.length > 0) ms.push(`Failed to add: ${fa.join(", ")}.`);
                cM =
                  ms.length > 0
                    ? ms.join(" ")
                    : "Batch action failed or no valid actions.";
              } else cM = "Invalid batch actions format.";
              break;
            case Actions.ACTION_DELETE_HABIT:
              const idDel = findHabitIdByTitle(bR.title);
              if (idDel) {
                rC = true;
                aD = {
                  ...aD,
                  habitIds: [idDel],
                  title: bR.title,
                  confirmationPrompt: `Are you sure you want to delete the habit "${bR.title}"? (yes/no)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = `Habit "${bR.title}" not found.`;
              break;
            case Actions.ACTION_COMPLETE_HABIT_DATE:
              const idL = findHabitIdByTitle(bR.title);
              const dSL = bR.date || formatDate(new Date());
              const sL = bR.status;
              const dL = parseDate(dSL);
              const hTL = habits.find((h) => h.id === idL);
              if (idL && dL && typeof sL === "boolean") {
                if (hTL?.isMeasurable)
                  cM = `Cannot mark measurable habit "${bR.title}" as simply done/missed via chat. Please log its value directly.`;
                else {
                  await updateHabitLog(idL, dL, sL);
                  const sTxt = sL
                    ? hTL?.type === "bad"
                      ? "avoided"
                      : "done"
                    : hTL?.type === "bad"
                    ? "indulged"
                    : "missed";
                  cM = `Marked "${bR.title}" as ${sTxt} for ${dSL}.`;
                }
              } else
                cM = `Could not log habit "${bR.title}". Please ensure title, date, and status are correct.`;
              break;
            case Actions.ACTION_SUGGEST_HABITS:
              if (Array.isArray(bR.habits) && bR.habits.length > 0) {
                const vS = bR.habits.filter((h) => h && h.title);
                if (vS.length > 0) {
                  rC = true;
                  const ts = vS.map((h) => `"${h.title}"`).join(", ");
                  aD = {
                    ...aD,
                    habits: vS,
                    confirmationPrompt: `Would you like to add these suggested habits: ${ts}? (yes/no)`,
                  };
                  cP = aD.confirmationPrompt;
                } else cM = "AI suggested invalid habits.";
              } else cM = "AI could not suggest habits at this time.";
              break;
            case Actions.ACTION_DELETE_ALL_HABITS:
              if (habits.length > 0) {
                rC = true;
                aD = {
                  ...aD,
                  confirmationPrompt: `Are you sure you want to delete all ${habits.length} habits? This action cannot be undone. (yes/no)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = "There are no habits to delete.";
              break;
            case Actions.ACTION_COMPLETE_ALL_HABITS_TODAY:
              const tCAT = new Date();
              const aNM = habits.filter(
                (h) => !h.isMeasurable && isHabitScheduledForDate(h, tCAT)
              );
              if (aNM.length > 0) {
                rC = true;
                aD = {
                  ...aD,
                  confirmationPrompt: `Mark all ${aNM.length} non-measurable habits scheduled for today as done/avoided? (yes/no)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = "No non-measurable habits are scheduled for today.";
              break;
            default:
              cM = "Unknown action received from AI.";
              console.warn("Unknown AI Action:", bR.action);
          }
        } catch (e) {
          console.error("Error processing AI action:", e);
          cM = "Error processing AI action.";
          rC = false;
        }
      } else {
        cM = bR.text || "I'm not sure how to respond to that.";
        const nk = ["my name is ", "i'm ", "im ", "call me "];
        const kf = nk.find((kw) => lowerMsg.startsWith(kw));
        if (kf) {
          const pN = msgTxt
            .substring(kf.length)
            .trim()
            .replace(/[^a-zA-Z\s-]/g, "")
            .trim();
          if (pN && pN.length >= 2 && pN.length <= 30) {
            const fN = pN
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
            setUserName(fN);
            cM = `Nice to meet you, ${fN}! How can I help with your habits?`;
          }
        }
      }
      if (rC && aD?.confirmationPrompt) {
        setPendingActionData(aD);
        setAwaitingConfirmation(true);
        cM = cP;
      } else {
        setPendingActionData(null);
        setAwaitingConfirmation(false);
      }

      if (cM) {
        console.log("[App.jsx] Bot message to add to chat:", cM);
        setChatHistory((p) => [...p, { sender: "bot", text: cM }]);
      } else if (!rC) {
        console.warn(
          "[App.jsx] No message (cM empty) from AI or action processing issue (handleSendChatMessage):",
          bR
        );
        setChatHistory((p) => [
          ...p,
          { sender: "bot", text: "Action processed or an issue occurred." },
        ]);
      }

      const fw = ["bye", "goodbye", "exit", "close chat", "close"];
      if (fw.includes(lowerMsg)) setTimeout(toggleChat, 1000);
    } catch (e) {
      console.error("Critical error in chat handling:", e);
      setChatHistory((p) => [
        ...p,
        {
          sender: "bot",
          text: "A critical error occurred with the AI assistant.",
        },
      ]);
      setPendingActionData(null);
      setAwaitingConfirmation(false);
    } finally {
      setIsChatLoading(false);
      const fw = ["bye", "goodbye", "exit", "close chat", "close"];
      const sc = fw.includes(lowerMsg);
      if (!awaitingConfirmation && !sc)
        setTimeout(() => setFocusChatInput(true), 0);
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
    updateHabitLog,
    setUserName,
    setHabits,
    setHabitLog,
    toggleChat,
    setChatInput,
  ]);

  const setupSpeechRecognition = useCallback(() => {
    const SRA = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRA) return;
    const r = new SRA();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onstart = () => {
      setIsListening(true);
      setChatInput("Listening...");
    };
    r.onresult = (e) => {
      const t = e.results[e.results.length - 1][0].transcript.trim();
      setChatInput(t);
    };
    r.onerror = (e) => {
      console.error("Speech err:", e.error);
      let m = `Speech err: ${e.error}`;
      if (e.error === "not-allowed" || e.error === "service-not-allowed")
        m = "Microphone access denied.";
      else if (e.error === "no-speech") m = "No speech detected.";
      else if (e.error === "audio-capture") m = "Microphone error.";
      else if (e.error === "network")
        m = "Network error during speech recognition.";
      setChatHistory((p) => [...p, { sender: "bot", text: m }]);
      setIsListening(false);
      if (chatInputRef.current?.value === "Listening...") setChatInput("");
    };
    r.onend = () => {
      setIsListening(false);
      if (chatInputRef.current?.value === "Listening...") setChatInput("");
      chatInputRef.current?.focus();
    };
    recognitionRef.current = r;
  }, [setChatHistory, setChatInput]);

  useEffect(() => {
    setupSpeechRecognition();
    return () => recognitionRef.current?.abort();
  }, [setupSpeechRecognition]);

  const handleMicClick = useCallback(() => {
    if (!recognitionRef.current) {
      setChatHistory((p) => [
        ...p,
        {
          sender: "bot",
          text: "Speech recognition is not available in your browser.",
        },
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
          console.error("Mic access err:", err);
          let t = "Voice input error.";
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          )
            t = "Microphone access denied by user.";
          else if (err.name === "NotFoundError") t = "No microphone found.";
          setChatHistory((p) => [...p, { sender: "bot", text: t }]);
          setIsListening(false);
        });
    }
  }, [isListening, setChatHistory, setChatInput]);

  const NavItem = ({ to, children, icon: Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors 
        ${
          isActive
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50"
        }`
      }
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{children}</span>
    </NavLink>
  );

  const exportData = () => {
    const dataToExport = { habits, habitLog };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `habit_tracker_data_${formatDate(new Date())}.json`;
    link.click();
    link.remove();
  };

  const importData = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.habits && typeof imported.habitLog === "object") {
          const batch = writeBatch(db);
          const existingHabitsSnapshot = await getDocs(
            query(habitsCollectionRef)
          );
          existingHabitsSnapshot.forEach((doc) => batch.delete(doc.ref));
          const existingLogsSnapshot = await getDocs(
            query(habitLogCollectionRef)
          );
          existingLogsSnapshot.forEach((doc) => batch.delete(doc.ref));

          imported.habits.forEach((habit) => {
            const habitId =
              habit.id ||
              `habit_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 9)}`;
            const newHabitRef = doc(db, "habits", habitId);
            const { id, ...habitData } = habit;
            batch.set(newHabitRef, habitData);
          });

          Object.entries(imported.habitLog).forEach(([dateStr, logs]) => {
            const logRef = doc(db, "habitLog", dateStr);
            batch.set(logRef, logs);
          });

          await batch.commit();
          alert("Data imported successfully! Firestore data updated.");
        } else {
          alert(
            'Invalid JSON file structure. Expected "habits" array and "habitLog" object.'
          );
        }
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Failed to import data. Check console for errors.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
        <Header
          userName={userName}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isChatOpen={isChatOpen}
        />

        <div className="flex flex-grow overflow-hidden">
          {/* Desktop Navigation Sidebar */}
          <nav className="hidden lg:flex flex-col space-y-1 p-4 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
            <NavItem to="/" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            <NavItem to="/manage" icon={ListChecks}>
              Manage Habits
            </NavItem>
            <NavItem to="/analytics" icon={LineChart}>
              Analytics
            </NavItem>
            <NavItem to="/streaks" icon={Flame}>
              Streaks
            </NavItem>
            <NavItem to="/settings" icon={SettingsIcon}>
              Settings
            </NavItem>
          </nav>

          {/* Main Content Area */}
          <main className="flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
            {/* Only show loading data when user is authenticated and data is loading */}
            {user && isLoadingData && (
              <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
                <p className="text-lg font-semibold animate-pulse dark:text-white">
                  Loading Data...
                </p>
              </div>
            )}
            {/* Show loading screen while authentication is being checked */}
            {isAuthLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Checking authentication...
                  </p>
                </div>
              </div>
            ) : (
              <Routes>
                {/* Login route - accessible without authentication */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes - only accessible when authenticated */}
                {user ? (
                  <>
                    <Route
                      path="/"
                      element={
                        <DashboardPage
                          habits={habits}
                          habitLog={habitLog}
                          openModalForNewHabit={openModalForNewHabit}
                          openModalForEditHabit={openModalForEditHabit}
                          handleDeleteHabitCallback={handleDeleteHabitCallback}
                          updateHabitLog={updateHabitLog}
                          isLoadingData={isLoadingData}
                        />
                      }
                    />
                    <Route
                      path="/manage"
                      element={
                        <ManageHabitsPage
                          habits={habits}
                          habitLog={habitLog}
                          openModalForEditHabit={openModalForEditHabit}
                          handleDeleteHabitCallback={handleDeleteHabitCallback}
                          openModalForNewHabit={openModalForNewHabit}
                        />
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <AnalyticsPage habits={habits} habitLog={habitLog} />
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <SettingsPage
                          exportData={exportData}
                          importData={importData}
                        />
                      }
                    />
                    <Route
                      path="/streaks"
                      element={
                        <StreaksPage habits={habits} habitLog={habitLog} />
                      }
                    />
                  </>
                ) : (
                  // Redirect to login if not authenticated
                  <Route path="*" element={<LoginPage />} />
                )}
              </Routes>
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />

        {/* Chat Button - Repositioned for mobile */}
        <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-3 lg:bottom-6 lg:right-6">
          {!isChatOpen && (
            <Button
              onClick={toggleChat}
              variant="default"
              size="icon"
              className="rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:scale-105 flex items-center justify-center"
              aria-label="Chat Assistant"
            >
              <MessageSquare size={24} />
            </Button>
          )}
        </div>

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
      </div>
    </Router>
  );
}

export default App;
