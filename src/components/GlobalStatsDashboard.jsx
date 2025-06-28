// src/components/GlobalStatsDashboard.jsx
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  CheckCircle,
  Circle,
  TrendingUp,
  Zap,
  Award,
  AlertCircle,
  Target,
  Calendar,
  BarChart3,
  Clock,
  Plus,
} from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

const GlobalStatsDashboard = ({
  globalStats,
  habits = [],
  habitLog = {},
  updateHabitLog,
  openModalForNewHabit,
}) => {
  const [activeTab, setActiveTab] = useState("stats");

  // Calculate today's habits data
  const todaysHabitsData = useMemo(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    const todaysLog = habitLog[todayStr] || {};
    const todaysHabits = habits.filter((habit) =>
      isHabitScheduledForDate(habit, today)
    );

    const completed = todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      return habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;
    });

    const pending = todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      return habit.isMeasurable
        ? !(typeof status === "number" && habit.goal && status >= habit.goal)
        : status !== true;
    });

    return {
      todayStr,
      todaysHabits,
      completed,
      pending,
      completionPercentage:
        todaysHabits.length > 0
          ? Math.round((completed.length / todaysHabits.length) * 100)
          : 0,
    };
  }, [habits, habitLog]);

  const handleQuickComplete = (habit) => {
    const newStatus = habit.isMeasurable ? habit.goal : true;
    updateHabitLog(todaysHabitsData.todayStr, habit.id, newStatus);
  };

  const formatPercent = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "N/A";
    }
    const roundedPercent = Math.round(value * 100);
    return `${roundedPercent}%`;
  };

  const getCompletionColor = (rate) => {
    if (rate >= 0.8) return "text-green-600 dark:text-green-400";
    if (rate >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getCompletionBg = (rate) => {
    if (rate >= 0.8)
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (rate >= 0.6)
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  const getMotivationalEmoji = (rate) => {
    if (rate >= 0.9) return "🔥";
    if (rate >= 0.8) return "🎯";
    if (rate >= 0.6) return "💪";
    if (rate >= 0.4) return "📈";
    return "🌱";
  };

  const StatBox = ({
    icon: Icon,
    label,
    value,
    valueSubtext,
    iconColorClass,
    bgColorClass,
    isMain = false,
    emoji,
  }) => (
    <div
      className={`relative flex flex-col items-center justify-center p-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${bgColorClass} ${
        isMain ? "col-span-2 sm:col-span-1" : ""
      } group hover:scale-[1.02] transform hover:-translate-y-1 cursor-pointer overflow-hidden`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10 flex items-center gap-3 mb-3">
        <div
          className={`p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm ${
            isMain ? "scale-110" : ""
          }`}
        >
          <Icon
            size={isMain ? 24 : 20}
            className={`${iconColorClass} group-hover:scale-110 transition-transform duration-300`}
          />
        </div>
        {emoji && (
          <span className={`${isMain ? "text-2xl" : "text-lg"} animate-pulse`}>
            {emoji}
          </span>
        )}
      </div>

      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap uppercase tracking-wider mb-2">
        {label}
      </span>

      <span
        className={`${
          isMain ? "text-3xl" : "text-2xl"
        } font-black text-gray-900 dark:text-gray-100 mb-1 tracking-tight`}
      >
        {value}
      </span>

      {valueSubtext && (
        <span
          className="block text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-full px-2 bg-white/60 dark:bg-gray-800/60 rounded-full py-1"
          title={valueSubtext}
        >
          {valueSubtext}
        </span>
      )}
    </div>
  );

  // Enhanced Today's Habits View Component
  const TodaysHabitsView = ({
    todaysHabitsData,
    handleQuickComplete,
    openModalForNewHabit,
  }) => {
    const { todaysHabits, completed, pending, completionPercentage } =
      todaysHabitsData;

    if (todaysHabits.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-full blur-2xl opacity-60"></div>
            <Clock className="relative mx-auto h-16 w-16 text-indigo-400 mb-4 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No Habits Today ✨
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Perfect time to create a new habit and start building your routine!
          </p>
          <Button
            onClick={openModalForNewHabit}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl px-6 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Habit
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Daily Progress
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Pending Habits */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Circle className="h-4 w-4 text-yellow-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Pending ({pending.length})
              </h4>
            </div>
            <div className="space-y-2">
              {pending.slice(0, 3).map((habit) => (
                <div
                  key={habit.id}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <Circle className="h-5 w-5 text-yellow-600 flex-shrink-0 group-hover:animate-pulse" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                    {habit.title}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleQuickComplete(habit)}
                    className="h-8 px-4 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border-0"
                  >
                    ✓ Done
                  </Button>
                </div>
              ))}
              {pending.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    +{pending.length - 3} more habits...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed Habits */}
        {completed.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Completed ({completed.length}) 🎉
              </h4>
            </div>
            <div className="space-y-2">
              {completed.slice(0, 2).map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 shadow-sm"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 animate-pulse" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                    {habit.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🎯</span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                      DONE
                    </span>
                  </div>
                </div>
              ))}
              {completed.length > 2 && (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    +{completed.length - 2} more completed
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-2 pt-6 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100">
            <BarChart3
              size={24}
              className="text-indigo-600 dark:text-indigo-400"
            />
            {activeTab === "stats"
              ? "Today's Progress Overview"
              : "Today's Habits"}
          </CardTitle>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeTab === "stats" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("stats")}
              className={`px-3 py-1.5 text-xs ${
                activeTab === "stats"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Stats
            </Button>
            <Button
              variant={activeTab === "habits" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("habits")}
              className={`px-3 py-1.5 text-xs ${
                activeTab === "habits"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Today ({todaysHabitsData.todaysHabits.length})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6 px-6">
        {activeTab === "stats" ? (
          // Stats View
          !globalStats ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" />
                <span>Loading your daily insights...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox
                icon={Target}
                label="Completion Rate"
                value={formatPercent(globalStats.overallCompletionRate)}
                iconColorClass={getCompletionColor(
                  globalStats.overallCompletionRate
                )}
                bgColorClass={getCompletionBg(
                  globalStats.overallCompletionRate
                )}
                isMain={true}
                emoji={getMotivationalEmoji(globalStats.overallCompletionRate)}
              />
              <StatBox
                icon={Zap}
                label="Best Streak"
                value={
                  globalStats.longestStreak
                    ? `${globalStats.longestStreak.length} days`
                    : "Start today!"
                }
                valueSubtext={globalStats.longestStreak?.habitTitle}
                iconColorClass="text-orange-600 dark:text-orange-400"
                bgColorClass="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 border"
                emoji={
                  globalStats.longestStreak &&
                  globalStats.longestStreak.length >= 7
                    ? "⚡"
                    : "🎯"
                }
              />
              <StatBox
                icon={Award}
                label="Top Performer"
                value={
                  globalStats.bestHabit
                    ? globalStats.bestHabit.title
                    : "No data yet"
                }
                valueSubtext={
                  globalStats.bestHabit
                    ? formatPercent(globalStats.bestHabit.score)
                    : null
                }
                iconColorClass="text-emerald-600 dark:text-emerald-400"
                bgColorClass="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 border"
                emoji={globalStats.bestHabit ? "🏆" : "📊"}
              />
              <StatBox
                icon={AlertCircle}
                label="Needs Attention"
                value={
                  globalStats.worstHabit
                    ? globalStats.worstHabit.title
                    : "All good!"
                }
                valueSubtext={
                  globalStats.worstHabit
                    ? formatPercent(globalStats.worstHabit.score)
                    : null
                }
                iconColorClass="text-rose-600 dark:text-rose-400"
                bgColorClass="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 border"
                emoji={globalStats.worstHabit ? "⚠️" : "✅"}
              />
            </div>
          )
        ) : (
          // Today's Habits View
          <TodaysHabitsView
            todaysHabitsData={todaysHabitsData}
            handleQuickComplete={handleQuickComplete}
            openModalForNewHabit={openModalForNewHabit}
          />
        )}
      </CardContent>
    </Card>
  );
};

export { GlobalStatsDashboard };
