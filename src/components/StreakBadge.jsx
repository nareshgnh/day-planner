// src/components/StreakBadge.jsx
import React from "react";
import { Flame, Trophy, Zap, Target } from "lucide-react";

const StreakBadge = ({
  currentStreak,
  bestStreak,
  habitTitle,
  size = "default",
  showMilestone = true,
}) => {
  // Milestone thresholds
  const milestones = [7, 14, 30, 50, 100, 365];

  // Find next milestone
  const nextMilestone = milestones.find((m) => m > currentStreak);
  const daysToMilestone = nextMilestone ? nextMilestone - currentStreak : null;

  // Get streak level and color
  const getStreakLevel = (streak) => {
    if (streak >= 365)
      return {
        level: "legendary",
        color: "from-purple-500 to-pink-500",
        icon: Trophy,
      };
    if (streak >= 100)
      return {
        level: "master",
        color: "from-yellow-400 to-orange-500",
        icon: Trophy,
      };
    if (streak >= 50)
      return {
        level: "expert",
        color: "from-blue-500 to-purple-500",
        icon: Zap,
      };
    if (streak >= 30)
      return {
        level: "advanced",
        color: "from-green-500 to-blue-500",
        icon: Target,
      };
    if (streak >= 14)
      return {
        level: "strong",
        color: "from-orange-500 to-red-500",
        icon: Flame,
      };
    if (streak >= 7)
      return {
        level: "building",
        color: "from-yellow-500 to-orange-400",
        icon: Flame,
      };
    if (streak >= 3)
      return {
        level: "starting",
        color: "from-green-400 to-green-500",
        icon: Flame,
      };
    return { level: "new", color: "from-gray-400 to-gray-500", icon: Flame };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const Icon = streakInfo.icon;

  // Size variants
  const sizeClasses = {
    small: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    large: "text-base px-4 py-2",
  };

  const iconSizes = {
    small: "h-3 w-3",
    default: "h-4 w-4",
    large: "h-5 w-5",
  };

  if (currentStreak === 0) {
    return (
      <div
        className={`inline-flex items-center space-x-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${sizeClasses[size]}`}
      >
        <Flame className={`${iconSizes[size]} opacity-50`} />
        <span>Start streak</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Main streak badge */}
      <div
        className={`inline-flex items-center space-x-1 rounded-full bg-gradient-to-r ${streakInfo.color} text-white font-medium ${sizeClasses[size]} shadow-sm`}
      >
        <Icon className={`${iconSizes[size]}`} />
        <span>
          {currentStreak} day{currentStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Milestone progress (only for default+ sizes) */}
      {showMilestone && size !== "small" && nextMilestone && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{daysToMilestone} days</span> to{" "}
          {nextMilestone}-day milestone
        </div>
      )}

      {/* Best streak indicator */}
      {bestStreak > currentStreak && size !== "small" && (
        <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-1">
          <Trophy className="h-3 w-3" />
          <span>Best: {bestStreak}</span>
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
