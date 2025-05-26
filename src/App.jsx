// src/App.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

// Firebase Imports
import { db } from "./firebaseConfig";
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
} from "firebase/firestore";

// Hooks
import { useDarkMode } from "./hooks/useDarkMode";

// Components
import { Header } from "./components/Header";
import { HabitList } from "./components/HabitList";
import { HabitModal } from "./components/HabitModal";
import { ChatPanel } from "./components/ChatPanel";
import { StatsPanel } from "./components/StatsPanel";
import { GlobalStatsDashboard } from "./components/GlobalStatsDashboard";
import { AiMotivationalMessage } from "./components/AiMotivationalMessage";
import { Button } from "./ui/Button";

// Utils & Constants
import {
  formatDate,
  parseDate,
  isHabitScheduledForDate,
} from "./utils/helpers";
import { fetchChatResponse, fetchDailyMotivation } from "./utils/api";
import { calculateGlobalStats } from "./utils/stats";
import * as Actions from "./constants";

// Icons
import { MessageSquare, Bell } from "lucide-react";

// --- Firestore Collection References ---
const habitsCollectionRef = collection(db, "habits");
const habitLogCollectionRef = collection(db, "habitLog");

// --- Initial State for Habit Modal ---
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

// --- Main App Component ---
function App() {
  // --- State Definitions ---
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [habits, setHabits] = useState([]);
  const [habitLog, setHabitLog] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [selectedHabitIdForStats, setSelectedHabitIdForStats] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const lastNotificationTime = useRef(0);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [isMotivationLoading, setIsMotivationLoading] = useState(true);
  const previousTodaysLogRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    console.log("Setting up Firestore listeners...");
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
        qs.forEach((doc) => {
          d[doc.id] = doc.data();
        });
        setHabitLog(d);
      },
      (e) => {
        console.error("Logs listener err:", e);
      }
    );
    return () => {
      unH();
      unL();
    };
  }, []);

  // Check Notification Permission on Load
  useEffect(() => {
    if ("Notification" in window)
      setNotificationPermission(Notification.permission);
    else {
      console.warn("Notifications not supported.");
      setNotificationPermission("denied");
    }
  }, []);

  // --- Notification Logic ---
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

  const showReminderNotification = useCallback(
    (title, body) => {
      if (notificationPermission !== "granted") return;
      const n = Date.now();
      if (n - lastNotificationTime.current < 1800000) return;
      lastNotificationTime.current = n;
      const o = {
        body: body,
        icon: "/vite.svg",
        tag: "habit-reminder",
        renotify: true,
      };
      try {
        const nt = new Notification(title, o);
        nt.onclick = () => window.focus();
      } catch (e) {
        console.error("Notif err:", e);
      }
    },
    [notificationPermission]
  );

  // Effect for Timed Reminder Check
  useEffect(() => {
    const checkNotify = () => {
      if (
        isLoadingData ||
        habits.length === 0 ||
        notificationPermission !== "granted"
      )
        return;
      const now = new Date();
      const h = now.getHours();
      if (h >= 18 && h < 22) {
        const todayStr = formatDate(now);
        const logT = habitLog[todayStr] || {};
        const activeT = habits.filter((hb) => isHabitScheduledForDate(hb, now));
        const pending = activeT.filter(
          (hb) => logT[hb.id] === undefined
        ).length;
        if (pending > 0)
          showReminderNotification(
            "Reminder",
            `You have ${pending} habit(s) pending today.`
          );
      }
    };
    const intId = setInterval(checkNotify, 1800000);
    return () => clearInterval(intId);
  }, [
    habits,
    habitLog,
    isLoadingData,
    notificationPermission,
    showReminderNotification,
  ]);

  // --- Function to load AI Motivation ---
  const loadDailyMotivation = useCallback(async () => {
    if (isLoadingData || !habits || habits.length === 0) return;
    console.log("Attempting loading daily motivation...");
    setIsMotivationLoading(true);
    try {
      const today = new Date();
      const todayStr = formatDate(today);
      const todaysLog = habitLog[todayStr] || {};
      const activeToday = habits.filter((habit) =>
        isHabitScheduledForDate(habit, today)
      );

      const currentHour = today.getHours();
      let timePeriod = "Evening";
      if (currentHour < 12) {
        timePeriod = "Morning";
      } else if (currentHour < 18) {
        timePeriod = "Afternoon";
      }

      if (activeToday.length > 0) {
        const msg = await fetchDailyMotivation(
          activeToday,
          todaysLog,
          timePeriod
        );
        setMotivationalMessage(msg);
      } else {
        setMotivationalMessage("No habits scheduled today. Ready to plan?");
      }
    } catch (e) {
      console.error(e);
      setMotivationalMessage("Could not load insight.");
    } finally {
      setIsMotivationLoading(false);
    }
  }, [habits, habitLog, isLoadingData]);

  // --- Effect to trigger AI Motivation Load ---
  useEffect(() => {
    if (!isLoadingData) {
      const todayStr = formatDate(new Date());
      const currentLogJSON = JSON.stringify(habitLog[todayStr] || {});
      if (previousTodaysLogRef.current !== currentLogJSON) {
        console.log("Triggering motivation load.");
        loadDailyMotivation();
        previousTodaysLogRef.current = currentLogJSON;
      }
    } else {
      previousTodaysLogRef.current = null;
    }
  }, [isLoadingData, habitLog, loadDailyMotivation]);

  // --- Core Logic Callbacks ---
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

    // Validation
    if (!newHabitData.title) {
      alert("Habit title required.");
      return false;
    }
    const startD = parseDate(newHabitData.startDate);
    const endD = newHabitData.endDate ? parseDate(newHabitData.endDate) : null;
    if (!startD || (newHabitData.endDate && !endD) || (endD && startD > endD)) {
      alert("Invalid date range.");
      return false;
    }
    if (
      scheduleType === "specific_days" &&
      (!newHabitData.scheduleDays || newHabitData.scheduleDays.length === 0)
    ) {
      alert("Select days for 'Specific Days'.");
      return false;
    }
    if (
      scheduleType === "frequency_weekly" &&
      (newHabitData.scheduleFrequency === null ||
        newHabitData.scheduleFrequency <= 0)
    ) {
      alert("Enter valid frequency.");
      return false;
    }
    if (isMeasurable && newHabitData.unit === undefined) {
      if (!habitDataToSave.unit || !habitDataToSave.unit.trim()) {
        alert("Unit required for measurable habits.");
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
        alert("Valid goal (> 0) required for measurable habits.");
        return false;
      }
      newHabitData.goal = habitDataToSave.goal;
    }

    // Final cleanup
    const finalHabitData = Object.entries(newHabitData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    try {
      console.log("Saving habit:", habitId, finalHabitData);
      await setDoc(habitDocRef, finalHabitData, { merge: true });
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
      const t = habits.find((h) => h.id === id)?.title || id;
      const dR = doc(db, "habits", id);
      try {
        await deleteDoc(dR);
        if (selectedHabitIdForStats === id) setSelectedHabitIdForStats(null);
      } catch (e) {
        console.error(e);
        alert("Failed delete");
      }
    },
    [habits, selectedHabitIdForStats]
  );

  // Renamed and SIMPLIFIED Logging Function
  const updateHabitLog = useCallback(
    async (habitId, date, value) => {
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

      console.log(`[updateHabitLog] Args:`, { habitId, dateStr, value });

      try {
        if (value === null || value === undefined) {
          console.log(`[updateHabitLog] Deleting field ${habitId}`);
          await updateDoc(logDocRef, { [habitId]: deleteField() });
          console.log(`[updateHabitLog] Success: Deleted field ${habitId}`);
        } else {
          console.log(`[updateHabitLog] Setting field ${habitId} to`, value);
          await setDoc(logDocRef, logData, { merge: true });
          console.log(`[updateHabitLog] Success: Set/Merged field ${habitId}`);
        }
      } catch (error) {
        if (
          !(
            error.code === "not-found" &&
            (value === null || value === undefined)
          )
        ) {
          console.error("[updateHabitLog] Error updating document:", error);
          alert("Failed to update habit log. Check console.");
        } else {
          console.log(
            "[updateHabitLog] Doc/Field not found on delete, likely already deleted."
          );
        }
      }
    },
    []
  );

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

  // --- Modal Handling Callbacks ---
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
    const success = await upsertHabit({
      id: editingHabit?.id,
      ...habitModalData,
    });
    if (success) closeHabitModal();
  }, [upsertHabit, editingHabit, habitModalData, closeHabitModal]);

  // --- Chat Handling Callbacks ---
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
                r = `Added ${rs.filter((s) => s).length}.`;
                break;
              case Actions.ACTION_DELETE_ALL_HABITS:
                try {
                  const q = query(habitsCollectionRef);
                  const qs = await getDocs(q);
                  await Promise.all(qs.docs.map((d) => deleteDoc(d.ref)));
                  setHabits([]);
                  setHabitLog({});
                  setSelectedHabitIdForStats(null);
                  r = `Deleted ${qs.size}.`;
                } catch (e) {
                  r = "Err deleting all.";
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
                  r = `Marked ${aNM.length} non-measurable today.`;
                } else r = "No non-measurable scheduled.";
                break;
              default:
                r = "Confirmed (unknown).";
            }
          } catch (e) {
            r = "Error performing action.";
            console.error(e);
          }
        }
        if (r) setChatHistory((p) => [...p, { sender: "bot", text: r }]);
        if (d || c === "no" || c === "n") {
          setPendingActionData(null);
          setAwaitingConfirmation(false);
        } else {
          setAwaitingConfirmation(true);
        }
      } catch (e) {
        console.error(e);
        setChatHistory((p) => [...p, { sender: "bot", text: "Confirm err." }]);
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
      if (!bR || (!bR.action && !bR.text)) {
        cM = "Invalid AI response.";
      } else if (bR.action && bR.action !== Actions.ACTION_GENERAL_CHAT) {
        aD = { ...bR };
        try {
          switch (bR.action) {
            case Actions.ACTION_ADD_HABIT:
              const added = await upsertHabit(bR);
              cM = added ? `Added "${bR.title}".` : `Could not add.`;
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
                if (ad > 0) ms.push(`Added ${ad}.`);
                if (du.length > 0) ms.push(`Duplicates: ${du.join(", ")}.`);
                if (fa.length > 0) ms.push(`Failed: ${fa.join(", ")}.`);
                cM = ms.length > 0 ? ms.join(" ") : "Batch fail.";
              } else cM = "Invalid batch.";
              break;
            case Actions.ACTION_DELETE_HABIT:
              const idDel = findHabitIdByTitle(bR.title);
              if (idDel) {
                rC = true;
                aD = {
                  ...aD,
                  habitIds: [idDel],
                  title: bR.title,
                  confirmationPrompt: `Delete "${bR.title}"? (y/n)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = `Cannot find "${bR.title}".`;
              break;
            case Actions.ACTION_COMPLETE_HABIT_DATE:
              const idL = findHabitIdByTitle(bR.title);
              const dSL = bR.date || formatDate(new Date());
              const sL = bR.status;
              const dL = parseDate(dSL);
              const hTL = habits.find((h) => h.id === idL);
              if (idL && dL && typeof sL === "boolean") {
                if (hTL?.isMeasurable) {
                  cM = `Cannot mark measurable "${bR.title}" via chat.`;
                } else {
                  await updateHabitLog(idL, dL, sL);
                  const sTxt = sL
                    ? hTL?.type === "bad"
                      ? "avoided"
                      : "done"
                    : hTL?.type === "bad"
                    ? "indulged"
                    : "missed";
                  cM = `Marked "${bR.title}" ${sTxt} for ${dSL}.`;
                }
              } else cM = `Cannot log "${bR.title}".`;
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
                    confirmationPrompt: `Add suggested: ${ts}? (y/n)`,
                  };
                  cP = aD.confirmationPrompt;
                } else cM = "Invalid suggestions.";
              } else cM = "Cannot suggest.";
              break;
            case Actions.ACTION_DELETE_ALL_HABITS:
              if (habits.length > 0) {
                rC = true;
                aD = {
                  ...aD,
                  confirmationPrompt: `Delete all ${habits.length}? (y/n)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = "No habits.";
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
                  confirmationPrompt: `Mark all ${aNM.length} non-measurable today? (y/n)`,
                };
                cP = aD.confirmationPrompt;
              } else cM = "No non-measurable scheduled.";
              break;
            default:
              cM = "Unknown action.";
              console.warn(bR.action);
          }
        } catch (e) {
          console.error(e);
          cM = "Err process action.";
          rC = false;
        }
      } else {
        cM = bR.text || "No understand.";
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
            cM = `Nice to meet you, ${fN}!`;
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
      if (cM) setChatHistory((p) => [...p, { sender: "bot", text: cM }]);
      else if (!rC) {
        console.warn("No msg:", bR);
        setChatHistory((p) => [...p, { sender: "bot", text: "Processed." }]);
      }
      const fw = ["bye", "goodbye", "exit", "close chat", "close"];
      if (fw.includes(lowerMsg)) setTimeout(toggleChat, 1000);
    } catch (e) {
      console.error(e);
      setChatHistory((p) => [...p, { sender: "bot", text: "Crit err." }]);
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

  // --- Voice Input Logic ---
  const setupSpeechRecognition = useCallback(() => {
    const SRA = window.Spe
echRecognition || window.webkitSpeechRecognition;
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
        m = "Mic denied.";
      else if (e.error === "no-speech") m = "No speech.";
      else if (e.error === "audio-capture") m = "Mic error.";
      else if (e.error === "network") m = "Net error.";
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
    return () => {
      recognitionRef.current?.abort();
    };
  }, [setupSpeechRecognition]);

  const handleMicClick = useCallback(() => {
    if (!recognitionRef.current) {
      setChatHistory((p) => [
        ...p,
        { sender: "bot", text: "No speech recog." },
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
          console.error("Mic err:", err);
          let t = "Voice err.";
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          )
            t = "Mic denied.";
          else if (err.name === "NotFoundError") t = "No mic.";
          setChatHistory((p) => [...p, { sender: "bot", text: t }]);
          setIsListening(false);
        });
    }
  }, [isListening, setChatHistory, setChatInput]);

  // --- Calendar Tile Styling Callback ---
  const getTileClassName = useCallback(
    ({ date, view }) => {
      if (view !== "month") return null;
      try {
        const dS = formatDate(date);
        if (!dS) return null;
        const lFD = habitLog?.[dS];
        const dO = parseDate(dS);
        if (!dO) return null;
        const sH = habits.filter((h) => isHabitScheduledForDate(h, dO));
        if (sH.length === 0) return null;
        let gMC = 0,
          lBGC = 0,
          cNM = 0,
          mNM = 0,
          lC = 0,
          pC = 0;
        sH.forEach((h) => {
          const s = lFD?.[h.id];
          if (s === undefined) pC++;
          else {
            lC++;
            if (h.isMeasurable) {
              if (typeof s === "number" && h.goal != null && s >= h.goal) gMC++;
              else if (typeof s === "number") lBGC++;
            } else {
              if (s === true) cNM++;
              else if (s === false) mNM++;
            }
          }
        });
        if (lC === 0 && pC > 0) return "habit-day-pending";
        if (lC === 0 && pC === 0) return null;
        const tMD = gMC + cNM;
        const tMB = lBGC + mNM;
        const aL = pC === 0;
        if (tMD === sH.length) return "habit-day-all-complete";
        if (aL && tMB > 0 && tMD === 0) return "habit-day-all-missed";
        if (lC > 0) return "habit-day-partial-log";
        return "habit-day-pending";
      } catch (e) {
        console.error("Err getTileClass:", e);
        return null;
      }
    },
    [habits, habitLog]
  );

  // --- Stats Panel Selection ---
  const handleSelectHabitForStats = useCallback((id) => {
    setSelectedHabitIdForStats((p) => (p === id ? null : id));
  }, []);

  const selectedHabitObject = useMemo(
    () =>
      !selectedHabitIdForStats
        ? null
        : habits.find((h) => h.id === selectedHabitIdForStats),
    [selectedHabitIdForStats, habits]
  );

  // --- Global Stats Calculation ---
  const globalStats = useMemo(
    () =>
      !habits || !habitLog || habits.length === 0 || isLoadingData
        ? {
            overallCompletionRate: 0,
            longestStreak: null,
            bestHabit: null,
            worstHabit: null,
          }
        : calculateGlobalStats(habits, habitLog),
    [habits, habitLog, isLoadingData]
  );

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
      <Header
        userName={userName}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isChatOpen={isChatOpen}
        notificationPermission={notificationPermission}
        requestNotificationPermission={requestNotificationPermission}
      />

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-2 md:py-4 flex flex-col gap-2 md:gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-24">
        {isLoadingData && (
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
            <p className="text-lg font-semibold animate-pulse dark:text-white">
              Loading...
            </p>
          </div>
        )}

        {/* Global Stats */}
        {!isLoadingData && habits.length > 0 && (
          <GlobalStatsDashboard globalStats={globalStats} />
        )}

        {/* AI Motivational Message */}
        {!isLoadingData && habits.length > 0 && (
          <AiMotivationalMessage
            message={motivationalMessage}
            isLoading={isMotivationLoading}
          />
        )}

        {/* Habit List & Stats Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div
            className={`space-y-4 md:space-y-6 flex flex-col ${
              selectedHabitObject ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <HabitList
              habits={habits}
              habitLog={habitLog}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              updateHabitLog={updateHabitLog}
              openModalForEditHabit={openModalForEditHabit}
              handleDeleteHabitCallback={handleDeleteHabitCallback}
              openModalForNewHabit={openModalForNewHabit}
              getTileClassName={getTileClassName}
              selectedHabitIdForStats={selectedHabitIdForStats}
              onSelectHabitForStats={handleSelectHabitForStats}
            />
          </div>
          {selectedHabitObject && (
            <div className="lg:col-span-1">
              <StatsPanel
                habit={selectedHabitObject}
                habitLog={habitLog}
                onClose={() => setSelectedHabitIdForStats(null)}
              />
            </div>
          )}
        </div>

        {/* Floating Chat Button */}
        {!isChatOpen && (
          <Button
            onClick={toggleChat}
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-10 rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:scale-110 flex items-center justify-center"
            aria-label="Chat"
          >
            <MessageSquare size={24} />
          </Button>
        )}
      </main>

      {/* Other Modals/Panels */}
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

      {/* Styles */}
      <style>{`
            /* Calendar styles */
            .react-calendar-wrapper { max-width: 100%; padding: 0; }
            .react-calendar { width: 100% !important; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: transparent; font-family: inherit; line-height: 1.5; } .dark .react-calendar { border-color: #374151; }
            .react-calendar__navigation button { min-width: 40px; background: none; border: none; padding: 0.5em; border-radius: 0.375rem; font-weight: 600; color: #374151; cursor: pointer; transition: background-color 0.2s; } .dark .react-calendar__navigation button { color: #d1d5db; }
            .react-calendar__navigation button:disabled { opacity: 0.5; cursor: not-allowed; }
            .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; } .dark .react-calendar__navigation button:enabled:hover, .dark .react-calendar__navigation button:enabled:focus { background-color: #374151; }
            .react-calendar__navigation__label { font-weight: bold; font-size: 0.9em; flex-grow: 0 !important; } .dark .react-calendar__navigation__label { color: #e5e7eb; }
            .react-calendar__month-view__weekdays { text-align: center; font-weight: bold; color: #6b7280; } .dark .react-calendar__month-view__weekdays abbr { color: #9ca3af; text-decoration: none !important; }
            .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; cursor: default; }
            .react-calendar__tile { border-radius: 0.375rem; transition: background-color 0.2s, border-color 0.2s, color 0.2s; padding: 0.5em 0.5em; line-height: 1.2; border: 1px solid transparent; text-align: center; cursor: pointer; font-size: 0.85em; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
            .react-calendar__month-view__days__day { color: #1f2937; } .dark .react-calendar__month-view__days__day { color: #e5e7eb; }
            .react-calendar__month-view__days__day--neighboringMonth { color: #9ca3af; opacity: 0.7; } .dark .react-calendar__month-view__days__day--neighboringMonth { color: #6b7280; opacity: 0.7; }
            .react-calendar__tile:disabled { background-color: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: 0.5; } .dark .react-calendar__tile:disabled { background-color: #1f2937; color: #6b7280; opacity: 0.5; }
            .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #e5e7eb; } .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus { background-color: #374151; }
            .react-calendar__tile--now { background: #dbeafe !important; font-weight: bold; border: 1px solid #bfdbfe !important; } .dark .react-calendar__tile--now { background: #1e3a8a !important; border-color: #3b82f6 !important; color: white !important; }
            .react-calendar__tile--active { background: #60a5fa !important; color: white !important; } .dark .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
            .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus { background: #3b82f6 !important; } .dark .react-calendar__tile--active:enabled:hover, .dark .react-calendar__tile--active:enabled:focus { background: #2563eb !important; }
            .habit-day-all-complete { background-color: #dcfce7 !important; border-color: #86efac !important; color: #166534 !important; } .dark .habit-day-all-complete { background-color: #064e3b !important; border-color: #34d399 !important; color: #a7f3d0 !important; }
            .habit-day-all-missed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; color: #991b1b !important; } .dark .habit-day-all-missed { background-color: #7f1d1d !important; border-color: #f87171 !important; color: #fecaca !important; }
            .habit-day-partial-log { background-color: #e0e7ff !important; border-color: #a5b4fc !important; color: #3730a3 !important; } .dark .habit-day-partial-log { background-color: #3730a3 !important; border-color: #818cf8 !important; color: #c7d2fe !important; }
            .habit-day-pending { border: 1px dashed #d1d5db !important; background-color: transparent !important; color: #6b7280 !important; } .dark .habit-day-pending { border-color: #4b5563 !important; color: #9ca3af !important; }
            .react-calendar__tile--active.habit-day-all-complete, .react-calendar__tile--active.habit-day-all-missed, .react-calendar__tile--active.habit-day-partial-log, .react-calendar__tile--active.habit-day-pending { color: white !important; } .dark .react-calendar__tile--active.habit-day-all-complete, .dark .react-calendar__tile--active.habit-day-all-missed, .dark .react-calendar__tile--active.habit-day-partial-log, .dark .react-calendar__tile--active.habit-day-pending { color: white !important; }
            /* Scrollbar styles */
            .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; } .dark .scrollbar-thin { scrollbar-color: #4b5563 transparent; } ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; border: 1px solid transparent; } .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; } ::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; } .dark ::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }
            /* Prose adjustments */
            .prose p:first-child, .prose p:last-child { margin-top: 0; margin-bottom: 0; } .dark .prose-invert { --tw-prose-body: #d1d5db; --tw-prose-headings: #fff; }
          `}</style>
    </div>
  );
}

export default App;