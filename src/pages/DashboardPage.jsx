// src/pages/DashboardPage.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { GlobalStatsDashboard } from "../components/GlobalStatsDashboard";
import { AiMotivationalMessage } from "../components/AiMotivationalMessage";
import { HabitList } from "../components/HabitList";
import { StatsPanel } from "../components/StatsPanel";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  formatDate,
  parseDate,
  isHabitScheduledForDate,
} from "../utils/helpers";
import { calculateGlobalStats } from "../utils/stats";
import { fetchDailyMotivation } from "../utils/api";
import { Plus, Target, Calendar, BarChart3, Zap } from "lucide-react";

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

  // Calculate today's progress
  const todayProgress = useMemo(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    const todaysLog = habitLog[todayStr] || {};
    const todaysHabits = habits.filter((habit) =>
      isHabitScheduledForDate(habit, today)
    );

    if (todaysHabits.length === 0) {
      return { total: 0, completed: 0, percentage: 0, remaining: 0 };
    }

    const completed = todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      return habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;
    }).length;

    return {
      total: todaysHabits.length,
      completed,
      percentage: Math.round((completed / todaysHabits.length) * 100),
      remaining: todaysHabits.length - completed,
    };
  }, [habits, habitLog]);

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
    <div className="flex flex-col gap-6 h-full">
      {/* Empty State - No habits */}
      {!isLoadingData && habits.length === 0 && (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md mx-auto text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6">
                <Target className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to Your Habit Tracker!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Start building positive habits today. Create your first habit
                  and begin your journey to a better you.
                </p>
              </div>
              <Button
                onClick={openModalForNewHabit}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg px-8 py-3 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoadingData && (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <div className="animate-pulse space-y-4">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard - Has habits */}
      {!isLoadingData && habits.length > 0 && (
        <>
          {/* Welcome Header - Compact & Elegant */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "Morning"
                    : new Date().getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                  ! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {todayProgress.total === 0
                    ? "No habits scheduled for today. Time to plan ahead!"
                    : "Ready to tackle your habits for today?"}
                </p>
              </div>
            </div>
          </div>

          {/* Improved Dashboard Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Main Content - 3/4 width */}
            <div className="xl:col-span-3 space-y-6">
              {/* Progress Overview - Compact Stats */}
              <GlobalStatsDashboard globalStats={globalStats} />

              {/* Calendar and Habits List */}
              <div
                className={`${
                  selectedHabitIdForStats
                    ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
                    : ""
                }`}
              >
                <div
                  className={`${
                    selectedHabitIdForStats ? "lg:col-span-2" : ""
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

                {/* Stats Panel - Inline when habit selected */}
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

            {/* Right Sidebar - 1/4 width */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <AiMotivationalMessage
                  message={motivationalMessage}
                  isLoading={isMotivationLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
