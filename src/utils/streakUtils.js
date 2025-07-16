// src/utils/streakUtils.js
import { formatDate, parseDate } from "./helpers";

/**
 * Calculate detailed streak information for a habit
 * @param {Object} habit - The habit object
 * @param {Object} habitLog - All habit logs
 * @returns {Object} Streak information
 */
export const calculateStreakInfo = (habit, habitLog) => {
  if (!habit || !habitLog) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      streakHistory: [],
      isOnStreak: false,
      lastCompletedDate: null,
      daysUntilBreak: null,
    };
  }

  const today = new Date();
  const logs = [];

  // Collect all relevant log entries for this habit
  Object.entries(habitLog).forEach(([dateStr, dayLog]) => {
    if (dayLog[habit.id] !== undefined) {
      const date = parseDate(dateStr);
      if (date) {
        const status = dayLog[habit.id];
        const isCompleted = habit.isMeasurable
          ? typeof status === "number" && habit.goal && status >= habit.goal
          : status === true;

        logs.push({
          date,
          dateStr,
          status,
          isCompleted,
        });
      }
    }
  });

  // Sort logs by date (newest first)
  logs.sort((a, b) => b.date - a.date);

  // Calculate current streak
  let currentStreak = 0;
  let streakBroken = false;
  let lastCompletedDate = null;

  // Start from today and work backwards
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const daysDiff = Math.floor((today - log.date) / (1000 * 60 * 60 * 24));

    if (log.isCompleted) {
      if (!lastCompletedDate) {
        lastCompletedDate = log.dateStr;
      }

      // If this is today or consecutive days, count it
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else if (daysDiff > currentStreak) {
        // Gap in streak, stop counting
        break;
      }
    } else {
      // Habit was logged but not completed
      if (daysDiff === currentStreak) {
        streakBroken = true;
        break;
      }
    }
  }

  // Calculate best streak (all time)
  let bestStreak = 0;
  let tempStreak = 0;
  const allDates = logs.map((log) => log.date).sort((a, b) => a - b);

  for (let i = 0; i < allDates.length; i++) {
    const log = logs.find((l) => l.date.getTime() === allDates[i].getTime());

    if (log && log.isCompleted) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate streak history (for visualization)
  const streakHistory = calculateStreakHistory(logs);

  // Determine if currently on streak
  const isOnStreak = currentStreak > 0 && !streakBroken;

  // Calculate days until streak breaks (if missed today)
  const todayStr = formatDate(today);
  const todayLog = habitLog[todayStr];
  const todayStatus = todayLog ? todayLog[habit.id] : undefined;
  const completedToday = habit.isMeasurable
    ? typeof todayStatus === "number" && habit.goal && todayStatus >= habit.goal
    : todayStatus === true;

  const daysUntilBreak = !completedToday && isOnStreak ? 1 : null;

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    streakHistory,
    isOnStreak,
    lastCompletedDate,
    daysUntilBreak,
    completedToday,
  };
};

/**
 * Calculate streak history for visualization
 * @param {Array} logs - Sorted log entries
 * @returns {Array} Array of streak periods
 */
const calculateStreakHistory = (logs) => {
  const streaks = [];
  let currentStreakStart = null;
  let currentStreakLength = 0;

  // Sort logs by date (oldest first for history calculation)
  const sortedLogs = [...logs].sort((a, b) => a.date - b.date);

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];

    if (log.isCompleted) {
      if (!currentStreakStart) {
        currentStreakStart = log.dateStr;
        currentStreakLength = 1;
      } else {
        currentStreakLength++;
      }
    } else {
      // Streak broken, save it if it was significant
      if (currentStreakStart && currentStreakLength >= 3) {
        streaks.push({
          startDate: currentStreakStart,
          endDate: sortedLogs[i - 1]?.dateStr,
          length: currentStreakLength,
        });
      }
      currentStreakStart = null;
      currentStreakLength = 0;
    }
  }

  // Don't forget the current streak if it's ongoing
  if (currentStreakStart && currentStreakLength >= 3) {
    streaks.push({
      startDate: currentStreakStart,
      endDate: sortedLogs[sortedLogs.length - 1]?.dateStr,
      length: currentStreakLength,
      isCurrent: true,
    });
  }

  return streaks;
};

/**
 * Check if a streak milestone was just reached
 * @param {number} previousStreak - Previous streak count
 * @param {number} currentStreak - Current streak count
 * @returns {number|null} Milestone reached or null
 */
export const checkMilestoneReached = (previousStreak, currentStreak) => {
  const milestones = [7, 14, 30, 50, 100, 365];

  for (const milestone of milestones) {
    if (previousStreak < milestone && currentStreak >= milestone) {
      return milestone;
    }
  }

  return null;
};

/**
 * Get motivational message based on streak status
 * @param {Object} streakInfo - Streak information
 * @param {string} habitTitle - Habit title
 * @returns {string} Motivational message
 */
export const getStreakMotivation = (streakInfo, habitTitle) => {
  const { currentStreak, bestStreak, isOnStreak, daysUntilBreak } = streakInfo;

  if (daysUntilBreak === 1) {
    return `🔥 Don't break your ${currentStreak}-day streak with "${habitTitle}"! Complete it today!`;
  }

  if (currentStreak === 0) {
    return `🌱 Start a new streak with "${habitTitle}" today!`;
  }

  if (currentStreak >= 30) {
    return `🏆 Amazing! ${currentStreak} days strong with "${habitTitle}"!`;
  }

  if (currentStreak >= 7) {
    return `🔥 Great momentum! ${currentStreak} days of "${habitTitle}"!`;
  }

  if (currentStreak >= 3) {
    return `💪 Building consistency! ${currentStreak} days of "${habitTitle}"!`;
  }

  return `✨ Keep going with "${habitTitle}"! You're at ${currentStreak} days!`;
};

/**
 * Get streak level and styling info
 * @param {number} streak - Current streak count
 * @returns {Object} Level information
 */
export const getStreakLevel = (streak) => {
  if (streak >= 365)
    return {
      level: "legendary",
      title: "Legendary",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-600 dark:text-purple-400",
    };
  if (streak >= 100)
    return {
      level: "master",
      title: "Master",
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
    };
  if (streak >= 50)
    return {
      level: "expert",
      title: "Expert",
      color: "from-blue-500 to-purple-500",
      textColor: "text-blue-600 dark:text-blue-400",
    };
  if (streak >= 30)
    return {
      level: "advanced",
      title: "Advanced",
      color: "from-green-500 to-blue-500",
      textColor: "text-green-600 dark:text-green-400",
    };
  if (streak >= 14)
    return {
      level: "strong",
      title: "Strong",
      color: "from-orange-500 to-red-500",
      textColor: "text-orange-600 dark:text-orange-400",
    };
  if (streak >= 7)
    return {
      level: "building",
      title: "Building",
      color: "from-yellow-500 to-orange-400",
      textColor: "text-yellow-600 dark:text-yellow-400",
    };
  if (streak >= 3)
    return {
      level: "starting",
      title: "Starting",
      color: "from-green-400 to-green-500",
      textColor: "text-green-600 dark:text-green-400",
    };

  return {
    level: "new",
    title: "New",
    color: "from-gray-400 to-gray-500",
    textColor: "text-gray-600 dark:text-gray-400",
  };
};
