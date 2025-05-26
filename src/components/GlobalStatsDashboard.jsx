// src/components/GlobalStatsDashboard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  CheckCircle,
  TrendingUp,
  Zap,
  Award,
  AlertCircle,
} from "lucide-react";

export const GlobalStatsDashboard = ({ globalStats }) => {
  if (!globalStats) {
    return (
      <Card className="bg-white/80 dark:bg-gray-950/80 mb-4">
        <CardContent className="pt-3 pb-3 text-center text-gray-500 text-xs">
          Loading daily snapshot...
        </CardContent>
      </Card>
    );
  }

  const { overallCompletionRate, longestStreak, bestHabit, worstHabit } =
    globalStats;

  const formatPercent = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "N/A";
    }
    const roundedPercent = Math.round(value * 100);
    return `${roundedPercent}%`;
  };

  const StatBox = ({ icon: Icon, label, value, valueSubtext, iconColorClass, bgColorClass }) => (
    <div className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow ${bgColorClass}`}>
      <Icon size={18} className={`mb-0.5 ${iconColorClass}`} />
      <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {label}
      </span>
      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mt-0 truncate w-full px-0.5">
        {value}
      </span>
      {valueSubtext && (
        <span className="block text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 leading-tight break-words truncate w-full px-0.5"
              title={valueSubtext}>
          ({valueSubtext})
        </span>
      )}
    </div>
  );

  return (
    <Card className="bg-white/70 dark:bg-gray-950/70 mb-3 md:mb-4 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <CardTitle className="text-sm md:text-base flex items-center gap-1.5 font-semibold">
          <TrendingUp size={18} className="text-indigo-500" />
          Daily Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pb-3 px-3 sm:px-4">
        <StatBox
          icon={CheckCircle}
          label="Today's Rate"
          value={formatPercent(overallCompletionRate)}
          iconColorClass="text-blue-600 dark:text-blue-400"
          bgColorClass="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatBox
          icon={Zap}
          label="Current Streak"
          value={longestStreak ? `${longestStreak.length}d` : "N/A"}
          valueSubtext={longestStreak?.habitTitle}
          iconColorClass="text-yellow-600 dark:text-yellow-400"
          bgColorClass="bg-yellow-50 dark:bg-yellow-900/30"
        />
        <StatBox
          icon={Award}
          label="Best Habit"
          value={bestHabit ? bestHabit.title : "N/A"}
          valueSubtext={bestHabit ? formatPercent(bestHabit.score) : null}
          iconColorClass="text-green-600 dark:text-green-400"
          bgColorClass="bg-green-50 dark:bg-green-900/30"
        />
        <StatBox
          icon={AlertCircle}
          label="Needs Focus"
          value={worstHabit ? worstHabit.title : "N/A"}
          valueSubtext={worstHabit ? `Rate: ${formatPercent(worstHabit.score)}` : null}
          iconColorClass="text-red-600 dark:text-red-400"
          bgColorClass="bg-red-50 dark:bg-red-900/30"
        />
      </CardContent>
    </Card>
  );
};