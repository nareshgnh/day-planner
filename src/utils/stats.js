// src/utils/stats.js
import { formatDate, parseDate, isHabitScheduledForDate } from "./helpers";

/**
 * Calculates the current streak for a single habit.
 * @param {object} habit - The habit object. Must include id, startDate, isMeasurable, goal (if measurable), type ('good' or 'bad').
 * @param {object} habitLog - The entire habit log.
 * @param {Array} _allHabits - Placeholder for potential future use with linked habits (currently unused).
 * @returns {object} { currentStreak }
 */
export const calculateStreak = (habit, habitLog, _allHabits = null) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return { currentStreak: 0 };
  }

  const habitId = habit.id;
  const startDate = parseDate(habit.startDate); // Ensure startDate is a Date object
  if (!startDate || isNaN(startDate)) {
    return { currentStreak: 0 };
  }

  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good'; // Default to 'good' if type is undefined

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight for comparisons

  let dateToCheck = new Date(today);

  // Loop backwards day by day
  // Consider a practical limit for how far back to check, e.g., 2 years (730 days)
  // or until habit start date.
  for (let i = 0; i < 730; i++) { // Check up to 2 years back
    if (dateToCheck < startDate) {
      break; // Stop if we go before the habit's start date
    }

    const dateStr = formatDate(dateToCheck); // Format for habitLog lookup

    // Check if the habit was scheduled for this day
    if (isHabitScheduledForDate(habit, dateToCheck)) {
      const logEntry = habitLog[dateStr]?.[habitId];
      let successToday = false;

      if (logEntry !== undefined) { // A log entry exists
        if (habitType === 'bad') {
          if (isMeasurable) {
            // For a "bad" measurable habit, success is logging a value *below* the goal.
            // Example: Goal is to spend < $50. If goal is 50, then status < 50 is success.
            // This interpretation might need refinement based on specific use-case for "bad measurable habits".
            // Assuming goal is an upper limit not to exceed.
            if (typeof logEntry === 'number' && goal !== null) {
              successToday = logEntry < goal;
            } else {
              successToday = false; // Invalid log for measurable bad habit
            }
          } else {
            // For a "bad" non-measurable habit, success is logging `false` (avoided).
            successToday = logEntry === false;
          }
        } else { // 'good' habit type
          if (isMeasurable) {
            if (typeof logEntry === 'number' && goal !== null) {
              successToday = logEntry >= goal;
            } else {
              successToday = false; // Invalid log for measurable good habit
            }
          } else {
            // For a "good" non-measurable habit, success is logging `true`.
            successToday = logEntry === true;
          }
        }
      } else {
        // No log entry for a scheduled day means the streak is broken.
        successToday = false;
      }

      if (successToday) {
        currentStreak++;
      } else {
        // If scheduled but success condition not met (or not logged), break the loop.
        break;
      }
    }
    // If not scheduled for dateToCheck, the streak continues (we don't break, nor increment).
    // We just move to the previous day.

    dateToCheck.setDate(dateToCheck.getDate() - 1); // Move to the previous day
  }

  return { currentStreak };
};


/**
 * **REVISED:** Calculates stats for a single habit.
 * Focuses on current streak and completion totals needed for achievement rate.
 * Removed longest historical streak calculation.
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} { currentStreak, totalCompleted, totalFailed, totalOpportunities }
 */
export const calculateStats = (habit, habitLog) => {
  const defaults = {
    currentStreak: 0,
    totalCompleted: 0, // Combined goals met (M) and completed (NM)
    totalFailed: 0, // Combined logged below goal (M) and missed (NM)
    totalOpportunities: 0, // Count of scheduled days with a log entry
  };

  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    // console.warn(`Skipping stats: Invalid habit data for ${habit?.title || 'ID: '+habit?.id}`);
    return defaults;
  }

  const habitId = habit.id;
  const startDateObj = parseDate(habit.startDate); // Renamed to avoid conflict
  if (!startDateObj || isNaN(startDateObj)) {
    // console.warn(`Skipping stats: Invalid start date for habit ${habit.title}`);
    return defaults;
  }
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good'; // Added for clarity

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalOpportunities = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Use local midnight for comparisons

  // --- Calculate Totals for Achievement Rate (Iterating Forwards) ---
  let loopDate = new Date(startDateObj);
  while (loopDate <= today) {
    const dateStr = formatDate(loopDate);
    const scheduled = isHabitScheduledForDate(habit, loopDate);

    if (scheduled) {
      const status = habitLog[dateStr]?.[habitId];

      if (status !== undefined) {
        totalOpportunities++;
        let goalMetToday = false;

        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) {
              goalMetToday = status < goal; // Avoided if less than goal
            }
          } else {
            goalMetToday = status === false; // Avoided if false
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) {
              goalMetToday = status >= goal;
            }
          } else {
            goalMetToday = status === true;
          }
        }

        if (goalMetToday) totalCompleted++;
        else totalFailed++;
      }
    }
    loopDate.setDate(loopDate.getDate() + 1);
  }

  // --- Calculate Current Streak ---
  // Now using the new calculateStreak function
  const { currentStreak } = calculateStreak(habit, habitLog);


  return {
    currentStreak,
    totalCompleted,
    totalFailed,
    totalOpportunities,
  };
};

/**
 * Prepares data for the react-calendar-heatmap. (No changes needed here)
 * Uses levels: 0 (empty/not scheduled), 1 (fail/missed), 2 (success).
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {Array} Array of { date: 'YYYY-MM-DD', count: level } objects.
 */
export const prepareHeatmapData = (habit, habitLog) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return [];
  }

  const data = [];
  const habitId = habit.id;
  const startDate = parseDate(habit.startDate);
  const endDate = habit.endDate ? parseDate(habit.endDate) : null;
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good'; // Added

  if (!startDate || isNaN(startDate)) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let loopEndDate = endDate ? (endDate > today ? today : endDate) : today;

  let currentDate = new Date(startDate);
  while (currentDate <= loopEndDate) {
    const dateStr = formatDate(currentDate);
    let level = 0;

    if (isHabitScheduledForDate(habit, currentDate)) {
      const status = habitLog[dateStr]?.[habitId];

      if (status !== undefined) {
        let success = false;
        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status < goal;
          } else {
            success = status === false;
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status >= goal;
          } else {
            success = status === true;
          }
        }
        level = success ? 2 : 1; // 2 for success, 1 for fail/missed
      }
    }

    data.push({ date: dateStr, count: level });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

/**
 * Prepares data for Chart.js completion chart. (No changes needed here)
 * Calculates completions vs. misses for scheduled days *with logs*.
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} Chart.js compatible data structure { labels: [...], datasets: [...] }.
 */
export const prepareChartData = (
  habit,
  habitLog,
  type = "monthlyBarCompletion"
) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return { labels: [], datasets: [] };
  }

  const habitId = habit.id;
  const startDateObj = parseDate(habit.startDate); // Renamed
  if (!startDateObj || isNaN(startDateObj)) return { labels: [], datasets: [] };

  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  // const unit = habit.unit || ""; // unit not used
  const habitType = habit.type || 'good'; // Added

  const monthlyLogs = {};
  Object.keys(habitLog)
    .sort()
    .forEach((dateStr) => {
      const logDate = parseDate(dateStr);
      const status = habitLog[dateStr]?.[habitId];

      if (
        logDate &&
        logDate >= startDateObj &&
        status !== undefined &&
        isHabitScheduledForDate(habit, logDate)
      ) {
        const monthStr = dateStr.substring(0, 7);
        if (!monthlyLogs[monthStr]) {
          monthlyLogs[monthStr] = { completed: 0, failed: 0 };
        }

        let success = false;
        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status < goal;
          } else {
            success = status === false;
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status >= goal;
          } else {
            success = status === true;
          }
        }

        if (success) {
          monthlyLogs[monthStr].completed++;
        } else {
          monthlyLogs[monthStr].failed++;
        }
      }
    });

  const labels = Object.keys(monthlyLogs).sort();

  if (type === "monthlyBarCompletion") {
    const completedData = labels.map((month) => monthlyLogs[month].completed);
    const failedData = labels.map((month) => monthlyLogs[month].failed);

    return {
      labels,
      datasets: [
        {
          label: habitType === "bad" ? "Avoided" : "Goal Met / Done",
          data: completedData,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 1,
        },
        {
          label: habitType === "bad" ? "Indulged" : "Missed / Below Goal",
          data: failedData,
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(220, 38, 38, 1)",
          borderWidth: 1,
        },
      ],
    };
  }

  console.warn(`Chart type '${type}' not fully implemented or invalid.`);
  return { labels: [], datasets: [] };
};

/**
 * *** REVISED FUNCTION ***
 * Calculates global statistics across all habits.
 * Overall Completion Rate: Based *only* on today's scheduled/completed habits.
 * Longest Streak: Finds the max *current* streak among all habits.
 * Needs Focus: Identifies habits older than N days with a current streak of 0.
 * @param {Array} habits - Array of habit objects.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} { overallCompletionRate, longestStreak: { habitTitle, length }, bestHabit: { title, score }, worstHabit: { title, score } }
 */
export const calculateGlobalStats = (habits, habitLog).jsx
// src/utils/stats.js
import { formatDate, parseDate, isHabitScheduledForDate } from "./helpers";

/**
 * Calculates the current streak for a single habit.
 * @param {object} habit - The habit object. Must include id, startDate, isMeasurable, goal (if measurable), type ('good' or 'bad').
 * @param {object} habitLog - The entire habit log.
 * @param {Array} _allHabits - Placeholder for potential future use with linked habits (currently unused).
 * @returns {object} { currentStreak }
 */
export const calculateStreak = (habit, habitLog, _allHabits = null) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return { currentStreak: 0 };
  }

  const habitId = habit.id;
  const startDate = parseDate(habit.startDate); // Ensure startDate is a Date object
  if (!startDate || isNaN(startDate)) {
    return { currentStreak: 0 };
  }

  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good'; // Default to 'good' if type is undefined

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight for comparisons

  let dateToCheck = new Date(today);

  // Loop backwards day by day
  // Consider a practical limit for how far back to check, e.g., 2 years (730 days)
  // or until habit start date.
  for (let i = 0; i < 730; i++) { // Check up to 2 years back
    if (dateToCheck < startDate) {
      break; // Stop if we go before the habit's start date
    }

    const dateStr = formatDate(dateToCheck); // Format for habitLog lookup

    // Check if the habit was scheduled for this day
    if (isHabitScheduledForDate(habit, dateToCheck)) {
      const logEntry = habitLog[dateStr]?.[habitId];
      let successToday = false;

      if (logEntry !== undefined) { // A log entry exists
        if (habitType === 'bad') {
          if (isMeasurable) {
            // For a "bad" measurable habit, success is logging a value *below* the goal.
            // Example: Goal is to spend < $50. If goal is 50, then status < 50 is success.
            // This interpretation might need refinement based on specific use-case for "bad measurable habits".
            // Assuming goal is an upper limit not to exceed.
            if (typeof logEntry === 'number' && goal !== null) {
              successToday = logEntry < goal;
            } else {
              successToday = false; // Invalid log for measurable bad habit
            }
          } else {
            // For a "bad" non-measurable habit, success is logging `false` (avoided).
            successToday = logEntry === false;
          }
        } else { // 'good' habit type
          if (isMeasurable) {
            if (typeof logEntry === 'number' && goal !== null) {
              successToday = logEntry >= goal;
            } else {
              successToday = false; // Invalid log for measurable good habit
            }
          } else {
            // For a "good" non-measurable habit, success is logging `true`.
            successToday = logEntry === true;
          }
        }
      } else {
        // No log entry for a scheduled day means the streak is broken.
        successToday = false;
      }

      if (successToday) {
        currentStreak++;
      } else {
        // If scheduled but success condition not met (or not logged), break the loop.
        break;
      }
    }
    // If not scheduled for dateToCheck, the streak continues (we don't break, nor increment).
    // We just move to the previous day.

    dateToCheck.setDate(dateToCheck.getDate() - 1); // Move to the previous day
  }

  return { currentStreak };
};


/**
 * **REVISED:** Calculates stats for a single habit.
 * Focuses on current streak and completion totals needed for achievement rate.
 * Removed longest historical streak calculation.
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} { currentStreak, totalCompleted, totalFailed, totalOpportunities }
 */
export const calculateStats = (habit, habitLog) => {
  const defaults = {
    currentStreak: 0,
    totalCompleted: 0, // Combined goals met (M) and completed (NM)
    totalFailed: 0, // Combined logged below goal (M) and missed (NM)
    totalOpportunities: 0, // Count of scheduled days with a log entry
  };

  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    // console.warn(`Skipping stats: Invalid habit data for ${habit?.title || 'ID: '+habit?.id}`);
    return defaults;
  }

  const habitId = habit.id;
  const startDateObj = parseDate(habit.startDate); // Renamed to avoid conflict
  if (!startDateObj || isNaN(startDateObj)) {
    // console.warn(`Skipping stats: Invalid start date for habit ${habit.title}`);
    return defaults;
  }
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good'; // Added for clarity

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalOpportunities = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Use local midnight for comparisons

  // --- Calculate Totals for Achievement Rate (Iterating Forwards) ---
  let loopDate = new Date(startDateObj);
  while (loopDate <= today) {
    const dateStr = formatDate(loopDate);
    const scheduled = isHabitScheduledForDate(habit, loopDate);

    if (scheduled) {
      const status = habitLog[dateStr]?.[habitId];

      if (status !== undefined) {
        totalOpportunities++;
        let goalMetToday = false;

        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) {
              goalMetToday = status < goal; // Avoided if less than goal
            }
          } else {
            goalMetToday = status === false; // Avoided if false
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) {
              goalMetToday = status >= goal;
            }
          } else {
            goalMetToday = status === true;
          }
        }

        if (goalMetToday) totalCompleted++;
        else totalFailed++;
      }
    }
    loopDate.setDate(loopDate.getDate() + 1);
  }

  // --- Calculate Current Streak ---
  // Now using the new calculateStreak function
  const { currentStreak } = calculateStreak(habit, habitLog);


  return {
    currentStreak,
    totalCompleted,
    totalFailed,
    totalOpportunities,
  };
};

/**
 * Prepares data for the react-calendar-heatmap.
 * Uses levels: 0 (empty/not scheduled), 1 (fail/missed), 2 (success).
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {Array} Array of { date: 'YYYY-MM-DD', count: level } objects.
 */
export const prepareHeatmapData = (habit, habitLog) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return [];
  }

  const data = [];
  const habitId = habit.id;
  const startDate = parseDate(habit.startDate);
  const endDate = habit.endDate ? parseDate(habit.endDate) : null;
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good';

  if (!startDate || isNaN(startDate)) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let loopEndDate = endDate ? (endDate > today ? today : endDate) : today;

  let currentDate = new Date(startDate);
  while (currentDate <= loopEndDate) {
    const dateStr = formatDate(currentDate);
    let level = 0;

    if (isHabitScheduledForDate(habit, currentDate)) {
      const status = habitLog[dateStr]?.[habitId];

      if (status !== undefined) {
        let success = false;
        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status < goal;
          } else {
            success = status === false;
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status >= goal;
          } else {
            success = status === true;
          }
        }
        level = success ? 2 : 1;
      }
    }

    data.push({ date: dateStr, count: level });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

/**
 * Prepares data for Chart.js completion chart.
 * Calculates completions vs. misses for scheduled days *with logs*.
 * @param {object} habit - The habit object.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} Chart.js compatible data structure { labels: [...], datasets: [...] }.
 */
export const prepareChartData = (
  habit,
  habitLog,
  type = "monthlyBarCompletion"
) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return { labels: [], datasets: [] };
  }

  const habitId = habit.id;
  const startDateObj = parseDate(habit.startDate);
  if (!startDateObj || isNaN(startDateObj)) return { labels: [], datasets: [] };

  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const habitType = habit.type || 'good';

  const monthlyLogs = {};
  Object.keys(habitLog)
    .sort()
    .forEach((dateStr) => {
      const logDate = parseDate(dateStr);
      const status = habitLog[dateStr]?.[habitId];

      if (
        logDate &&
        logDate >= startDateObj &&
        status !== undefined &&
        isHabitScheduledForDate(habit, logDate)
      ) {
        const monthStr = dateStr.substring(0, 7);
        if (!monthlyLogs[monthStr]) {
          monthlyLogs[monthStr] = { completed: 0, failed: 0 };
        }

        let success = false;
        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status < goal;
          } else {
            success = status === false;
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) success = status >= goal;
          } else {
            success = status === true;
          }
        }

        if (success) {
          monthlyLogs[monthStr].completed++;
        } else {
          monthlyLogs[monthStr].failed++;
        }
      }
    });

  const labels = Object.keys(monthlyLogs).sort();

  if (type === "monthlyBarCompletion") {
    const completedData = labels.map((month) => monthlyLogs[month].completed);
    const failedData = labels.map((month) => monthlyLogs[month].failed);

    return {
      labels,
      datasets: [
        {
          label: habitType === "bad" ? "Avoided" : "Goal Met / Done",
          data: completedData,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 1,
        },
        {
          label: habitType === "bad" ? "Indulged" : "Missed / Below Goal",
          data: failedData,
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(220, 38, 38, 1)",
          borderWidth: 1,
        },
      ],
    };
  }

  console.warn(`Chart type '${type}' not fully implemented or invalid.`);
  return { labels: [], datasets: [] };
};

/**
 * *** REVISED FUNCTION ***
 * Calculates global statistics across all habits.
 * Overall Completion Rate: Based *only* on today's scheduled/completed habits.
 * Longest Streak: Finds the max *current* streak among all habits.
 * Needs Focus: Identifies habits older than N days with a current streak of 0.
 * @param {Array} habits - Array of habit objects.
 * @param {object} habitLog - The entire habit log.
 * @returns {object} { overallCompletionRate, longestStreak: { habitTitle, length }, bestHabit: { title, score }, worstHabit: { title, score } }
 */
export const calculateGlobalStats = (habits, habitLog) => {
  const defaults = {
    overallCompletionRate: 0,
    longestStreak: null,
    bestHabit: null,
    worstHabit: null,
  };
  if (!habits || habits.length === 0 || !habitLog) {
    return defaults;
  }

  const NEEDS_FOCUS_MIN_AGE_DAYS = 7;

  let maxCurrentStreak = { habitTitle: null, length: 0 };
  let habitStatsCache = {};

  habits.forEach((habit) => {
    if (!habit || !habit.id || !habit.startDate) return;

    // Use the modified calculateStats which internally uses the new calculateStreak
    const stats = calculateStats(habit, habitLog);
    habitStatsCache[habit.id] = stats;

    if (stats.currentStreak > maxCurrentStreak.length) {
      maxCurrentStreak = {
        habitTitle: habit.title,
        length: stats.currentStreak,
      };
    }
  });

  let scheduledToday = 0;
  let completedToday = 0;
  const today = new Date();
  const todayStr = formatDate(today);
  const todayLog = habitLog[todayStr] || {};

  habits.forEach((habit) => {
    if (!habitStatsCache[habit.id]) return;

    if (isHabitScheduledForDate(habit, today)) {
      scheduledToday++;
      const status = todayLog[habit.id];
      let goalMet = false;
      const isMeasurable = habit.isMeasurable || false;
      const goal = isMeasurable ? habit.goal : null;
      const habitType = habit.type || 'good';

      if (status !== undefined) {
        if (habitType === 'bad') {
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) goalMet = status < goal;
          } else {
            goalMet = status === false;
          }
        } else { // 'good' habit
          if (isMeasurable) {
            if (typeof status === "number" && goal !== null) goalMet = status >= goal;
          } else {
            goalMet = status === true;
          }
        }
      }
      if (goalMet) {
        completedToday++;
      }
    }
  });

  const todaysCompletionRate =
    scheduledToday > 0 ? completedToday / scheduledToday : 0;

  let bestHabit = null;
  let worstHabit = null;
  let habitScores = [];

  habits.forEach((habit) => {
    const stats = habitStatsCache[habit.id];
    if (!stats) return;

    const achievementRate =
      stats.totalOpportunities > 0
        ? stats.totalCompleted / stats.totalOpportunities
        : 0;

    habitScores.push({
      id: habit.id,
      title: habit.title,
      achievementRate: achievementRate,
      currentStreak: stats.currentStreak,
      startDate: habit.startDate,
      totalOpportunities: stats.totalOpportunities,
      type: habit.type || 'good', // Include type for "Needs Focus" logic
    });
  });

  if (habitScores.length > 0) {
    habitScores.sort((a, b) => {
      if (b.achievementRate !== a.achievementRate) {
        return b.achievementRate - a.achievementRate;
      }
      return b.currentStreak - a.currentStreak;
    });

    const bestCandidate = habitScores.find((h) => h.totalOpportunities > 0);
    if (bestCandidate) {
      bestHabit = {
        title: bestCandidate.title,
        score: bestCandidate.achievementRate,
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - NEEDS_FOCUS_MIN_AGE_DAYS);

    const needsFocusCandidates = habitScores.filter((habitInfo) => {
      const habitStartDate = parseDate(habitInfo.startDate);
      return (
        habitStartDate &&
        habitStartDate <= cutoffDate &&
        habitInfo.currentStreak === 0
      );
    });

    if (needsFocusCandidates.length > 0) {
      needsFocusCandidates.sort((a, b) => {
        if (a.achievementRate !== b.achievementRate) {
          return a.achievementRate - b.achievementRate;
        }
        return 0;
      });

      worstHabit = {
        title: needsFocusCandidates[0].title,
        score: needsFocusCandidates[0].achievementRate,
      };
    }
  }

  return {
    overallCompletionRate: todaysCompletionRate,
    longestStreak: maxCurrentStreak.length > 0 ? maxCurrentStreak : null,
    bestHabit,
    worstHabit,
  };
};

/**
 * Calculates the total points accumulated by the user based on habit logs.
 * Points are awarded for successfully completing/avoiding habits.
 * @param {Array<object>} habits - Array of habit objects. Each habit should have id, isMeasurable, goal (if measurable), and type ('good' or 'bad').
 * @param {object} habitLog - The entire habit log object, where keys are dates (YYYY-MM-DD)
 *                            and values are objects of habit logs for that date { [habitId]: logValue }.
 * @returns {number} The total calculated points.
 */
export const calculateTotalPoints = (habits, habitLog) => {
  let totalPoints = 0;

  if (!habits || !habitLog || habits.length === 0) {
    return 0;
  }

  for (const habit of habits) {
    if (!habit || !habit.id) {
      continue; // Skip if habit is invalid
    }

    const isMeasurable = habit.isMeasurable || false;
    const goal = isMeasurable ? habit.goal : null;
    const habitType = habit.type || 'good';

    for (const dateString in habitLog) {
      if (habitLog.hasOwnProperty(dateString)) {
        const dailyLogs = habitLog[dateString];
        const logValue = dailyLogs?.[habit.id];

        if (logValue !== undefined) {
          let success = false;
          if (habitType === 'bad') {
            if (isMeasurable) {
              // Bad measurable: success if value is LESS than goal (e.g., spend < $50)
              // Ensure goal is a number for comparison.
              if (typeof logValue === 'number' && typeof goal === 'number') {
                success = logValue < goal;
              }
            } else {
              // Bad non-measurable: success if value is false (e.g., did not smoke)
              success = logValue === false;
            }
          } else { // 'good' habit type
            if (isMeasurable) {
              // Good measurable: success if value is GREATER OR EQUAL to goal
              // Ensure goal is a number for comparison.
              if (typeof logValue === 'number' && typeof goal === 'number') {
                success = logValue >= goal;
              }
            } else {
              // Good non-measurable: success if value is true
              success = logValue === true;
            }
          }

          if (success) {
            totalPoints += 10; // Award 10 points for each success
          }
        }
      }
    }
  }

  return totalPoints;
};
