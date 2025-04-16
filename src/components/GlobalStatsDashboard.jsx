// src/components/GlobalStatsDashboard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  CheckCircle, // For Completion Rate (Today)
  TrendingUp, // For Section Title
  Zap, // For Current Streak
  Award, // For Best Habit
  AlertCircle, // For Needs Focus
} from "lucide-react";

export const GlobalStatsDashboard = ({ globalStats }) => {
  // Render nothing or a loading state if stats aren't ready
  if (!globalStats) {
    return (
      <Card className="bg-white/80 dark:bg-gray-950/80 mb-4 md:mb-6">
        <CardContent className="pt-4 pb-4 text-center text-gray-500 text-sm">
          Loading overall performance...
        </CardContent>
      </Card>
    );
  }

  // Destructure the calculated stats
  // Note: overallCompletionRate is NOW today's rate
  // Note: longestStreak is NOW the max CURRENT streak
  // Note: worstHabit is NOW the "Needs Focus" habit
  const { overallCompletionRate, longestStreak, bestHabit, worstHabit } =
    globalStats;

  // Helper to format percentage, handling NaN/undefined
  const formatPercent = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "N/A";
    }
    const roundedPercent = Math.round(value * 100);
    return `${roundedPercent}%`;
  };

  // REMOVED truncateTitle helper - will show full names

  return (
    <Card className="bg-white/80 dark:bg-gray-950/80 mb-4 md:mb-6">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 font-semibold">
          <TrendingUp size={20} className="text-indigo-500" />
          Daily Snapshot {/* Updated Title */}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pb-4">
        {/* Today's Completion Rate */}
        <div className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle
            size={20}
            className="mb-1 text-blue-600 dark:text-blue-400"
          />
          <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
            Today's Rate {/* Updated Label */}
          </span>
          <span className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100 mt-0.5">
            {formatPercent(overallCompletionRate)}
          </span>
        </div>

        {/* Max Current Streak */}
        <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
          <Zap
            size={20}
            className="mb-1 text-yellow-600 dark:text-yellow-400"
          />
          <span className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Current Streak {/* Updated Label */}
          </span>
          {longestStreak ? (
            // Container to allow wrapping if needed
            <div className="mt-0.5 flex flex-col items-center w-full px-1">
              <span className="block text-lg sm:text-xl font-bold text-yellow-900 dark:text-yellow-100">
                {longestStreak.length}d
              </span>
              {/* Show full title, allow wrapping */}
              <span
                className="block text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-300 leading-tight break-words" // Allow wrapping
                title={longestStreak.habitTitle} // Tooltip still useful
              >
                ({longestStreak.habitTitle}) {/* Display full title */}
              </span>
            </div>
          ) : (
            <span className="text-lg sm:text-xl font-bold text-yellow-900 dark:text-yellow-100 mt-0.5">
              N/A
            </span>
          )}
        </div>

        {/* Best Performing Habit */}
        <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
          <Award
            size={20}
            className="mb-1 text-green-600 dark:text-green-400"
          />
          <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
            Best Habit
          </span>
          {bestHabit ? (
            <div className="mt-0.5 flex flex-col items-center w-full px-1">
              {/* Show full title, allow wrapping */}
              <span
                className="block text-lg sm:text-xl font-bold text-green-900 dark:text-green-100 leading-tight break-words" // Allow wrapping
                title={bestHabit.title}
              >
                {bestHabit.title} {/* Display full title */}
              </span>
              <span className="block text-[10px] sm:text-xs text-green-700 dark:text-green-300">
                ({formatPercent(bestHabit.score)}){" "}
                {/* Score is achievement rate */}
              </span>
            </div>
          ) : (
            <span className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100 mt-0.5">
              N/A
            </span>
          )}
        </div>

        {/* Needs Focus */}
        <div className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
          <AlertCircle
            size={20}
            className="mb-1 text-red-600 dark:text-red-400"
          />
          <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">
            Needs Focus
          </span>
          {worstHabit ? (
            <div className="mt-0.5 flex flex-col items-center w-full px-1">
              {/* Show full title, allow wrapping */}
              <span
                className="block text-lg sm:text-xl font-bold text-red-900 dark:text-red-100 leading-tight break-words" // Allow wrapping
                title={worstHabit.title}
              >
                {worstHabit.title} {/* Display full title */}
              </span>
              {/* Optionally show the low achievement score for context */}
              <span className="block text-[10px] sm:text-xs text-red-700 dark:text-red-300">
                (Rate: {formatPercent(worstHabit.score)})
              </span>
            </div>
          ) : (
            <span className="text-lg sm:text-xl font-bold text-red-900 dark:text-red-100 mt-0.5">
              N/A
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
