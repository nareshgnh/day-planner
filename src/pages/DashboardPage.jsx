// src/pages/DashboardPage.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react"; // Added useEffect here
import { GlobalStatsDashboard } from "../components/GlobalStatsDashboard";
import { AiMotivationalMessage } from "../components/AiMotivationalMessage";
import { HabitList } from "../components/HabitList";
import { StatsPanel } from "../components/StatsPanel";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import {
  formatDate,
  parseDate,
  isHabitScheduledForDate,
} from "../utils/helpers";
import { calculateGlobalStats } from "../utils/stats";
import { fetchDailyMotivation } from "../utils/api";

const DashboardPage = ({
  habits,
  habitLog,
  openModalForNewHabit,
  openModalForEditHabit,
  handleDeleteHabitCallback,
  updateHabitLog,
  isLoadingData,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHabitIdForStats, setSelectedHabitIdForStats] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [isMotivationLoading, setIsMotivationLoading] = useState(true);
  const previousTodaysLogRef = useRef(null);

  // Calendar Tile Styling Callback
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

  const loadDailyMotivation = useCallback(async () => {
    if (isLoadingData || !habits || habits.length === 0) return;
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
      if (currentHour < 12) timePeriod = "Morning";
      else if (currentHour < 18) timePeriod = "Afternoon";

      if (activeToday.length > 0) {
        const msg = await fetchDailyMotivation(
          activeToday,
          todaysLog,
          timePeriod
        );
        setMotivationalMessage(msg);
      } else {
        setMotivationalMessage(
          "No habits scheduled today. Ready to plan for tomorrow?"
        );
      }
    } catch (e) {
      console.error(e);
      setMotivationalMessage("Could not load daily insight at this time.");
    } finally {
      setIsMotivationLoading(false);
    }
  }, [habits, habitLog, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) {
      const todayStr = formatDate(new Date());
      const currentLogJSON = JSON.stringify(habitLog[todayStr] || {});
      if (previousTodaysLogRef.current !== currentLogJSON) {
        loadDailyMotivation();
        previousTodaysLogRef.current = currentLogJSON;
      }
    }
  }, [isLoadingData, habitLog, loadDailyMotivation]); // useEffect is now defined

  return (
    <div className="flex flex-col gap-3 md:gap-4 h-full">
      {!isLoadingData && habits.length > 0 && (
        <GlobalStatsDashboard globalStats={globalStats} />
      )}
      {!isLoadingData && habits.length > 0 && (
        <AiMotivationalMessage
          message={motivationalMessage}
          isLoading={isMotivationLoading}
        />
      )}
      <div
        className={`grid grid-cols-1 ${
          selectedHabitObject ? "lg:grid-cols-3" : "lg:grid-cols-4"
        } gap-4 md:gap-6 flex-grow`}
      >
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

        {/* Quick Actions Panel - Always visible */}
        <div className="lg:col-span-1">
          <QuickActionsPanel
            habits={habits}
            habitLog={habitLog}
            selectedDate={selectedDate}
            updateHabitLog={updateHabitLog}
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
    </div>
  );
};

export default DashboardPage;
