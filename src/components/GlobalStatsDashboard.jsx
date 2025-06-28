// src/components/GlobalStatsDashboard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  TrendingUp,
  Zap,
  Award,
  AlertCircle,
  Target,
  BarChart3,
} from "lucide-react";

const GlobalStatsDashboard = ({ globalStats }) => {
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
      className={`flex flex-col items-center justify-center p-2 rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-200 border ${bgColorClass} group hover:scale-[1.02] transform`}
    >
      <div className="flex items-center gap-1 mb-1.5">
        <Icon
          size={16}
          className={`${iconColorClass} group-hover:scale-110 transition-transform`}
        />
        {emoji && <span className="text-xs">{emoji}</span>}
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap uppercase tracking-wide leading-tight">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 truncate w-full px-1 leading-tight">
        {value}
      </span>
      {valueSubtext && (
        <span
          className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-words truncate w-full px-1 leading-tight"
          title={valueSubtext}
        >
          {valueSubtext}
        </span>
      )}
    </div>
  );

  // Enhanced Today's Habits View Component - Removed (moved to TodaysHabitsPanel)

  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100">
          <BarChart3
            size={20}
            className="text-indigo-600 dark:text-indigo-400"
          />
          Progress Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 px-4">
        {/* Stats View */}
        {!globalStats ? (
          <div className="text-center text-gray-500 text-sm py-6">
            <div className="animate-pulse flex items-center justify-center gap-2">
              <BarChart3 size={16} className="text-indigo-400" />
              <span>Loading insights...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <StatBox
              icon={Target}
              label="Completion Rate"
              value={formatPercent(globalStats.overallCompletionRate)}
              iconColorClass={getCompletionColor(
                globalStats.overallCompletionRate
              )}
              bgColorClass={getCompletionBg(globalStats.overallCompletionRate)}
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
        )}
      </CardContent>
    </Card>
  );
};

export { GlobalStatsDashboard };
