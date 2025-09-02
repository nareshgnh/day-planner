// src/utils/stats.js
import { formatDate, parseDate, isHabitScheduledForDate } from "./helpers";

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
  const startDate = parseDate(habit.startDate);
  if (!startDate || isNaN(startDate)) {
    // console.warn(`Skipping stats: Invalid start date for habit ${habit.title}`);
    return defaults;
  }
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;

  let totalCompleted = 0;
  let totalFailed = 0;
  let totalOpportunities = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Use local midnight for comparisons

  // --- Calculate Totals for Achievement Rate (Iterating Forwards) ---
  let loopDate = new Date(startDate);
  while (loopDate <= today) {
    const dateStr = formatDate(loopDate);
    const scheduled = isHabitScheduledForDate(habit, loopDate);

    if (scheduled) {
      const status = habitLog[dateStr]?.[habitId];

      // Only count days with explicit logs for achievement rate totals
      if (status !== undefined) {
        totalOpportunities++;
        let goalMetToday = false;

        if (isMeasurable) {
          if (typeof status === "number") {
            goalMetToday = goal !== null && status >= goal;
            if (goalMetToday) totalCompleted++;
            else totalFailed++;
          } else {
            totalFailed++; // Non-numeric log for measurable counts as fail/miss
          }
        } else {
          // Non-Measurable
          if (status === true) {
            goalMetToday = true;
            totalCompleted++;
          } else if (status === false) {
            totalFailed++;
          } else {
            totalFailed++; // Non-boolean log counts as fail/miss
          }
        }
      }
    }
    // Move to the next day
    loopDate.setDate(loopDate.getDate() + 1);
  }

  // --- Calculate Current Streak (Iterating Backwards from Today) ---
  let currentStreak = 0;
  let streakDate = new Date(today); // Start from today

  while (streakDate >= startDate) {
    const scheduled = isHabitScheduledForDate(habit, streakDate);

    if (scheduled) {
      const dateStr = formatDate(streakDate);
      const status = habitLog[dateStr]?.[habitId];
      let goalMetToday = false;

      if (isMeasurable) {
        goalMetToday =
          typeof status === "number" && goal !== null && status >= goal;
      } else {
        goalMetToday = status === true;
      }

      if (goalMetToday) {
        currentStreak++;
      } else {
        // If scheduled but not completed (or not logged), streak ends here. Break loop.
        break;
      }
    }
    // else: If not scheduled, continue checking previous day without breaking streak.

    // Move to the previous day
    streakDate.setDate(streakDate.getDate() - 1);
  }

  return {
    currentStreak,
    // longestHistoricalStreak removed
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

  if (!startDate || isNaN(startDate)) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Iterate up to today or end date, whichever is earlier
  let loopEndDate = endDate ? (endDate > today ? today : endDate) : today;

  let currentDate = new Date(startDate);
  while (currentDate <= loopEndDate) {
    const dateStr = formatDate(currentDate);
    let level = 0; // Default: 0 (empty/pending/not scheduled)

    if (isHabitScheduledForDate(habit, currentDate)) {
      const status = habitLog[dateStr]?.[habitId];

      if (status !== undefined) {
        // Only color if logged
        if (isMeasurable) {
          if (typeof status === "number") {
            level = goal !== null && status >= goal ? 2 : 1; // 2: Goal Met, 1: Logged < Goal
          } // else level remains 0 if status is not a number
        } else {
          if (status === true) level = 2; // 2: Done / Avoided
          else if (status === false) level = 1; // 1: Missed / Indulged
          // else level remains 0 if status is not boolean
        }
      }
      // else level remains 0 (pending)
    } else {
      // If not scheduled, treat as empty (level 0)
      level = 0;
    }

    data.push({ date: dateStr, count: level });

    // Move to the next day
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
  type = "monthlyBarCompletion" // Keep type for potential future expansion
) => {
  if (!habit || !habitLog || !habit.id || !habit.startDate) {
    return { labels: [], datasets: [] };
  }

  const habitId = habit.id;
  const startDate = parseDate(habit.startDate);
  if (!startDate || isNaN(startDate)) return { labels: [], datasets: [] };

  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const unit = habit.unit || "";

  // Group logs by month (YYYY-MM) for days that were SCHEDULED and LOGGED
  const monthlyLogs = {};
  Object.keys(habitLog)
    .sort()
    .forEach((dateStr) => {
      const logDate = parseDate(dateStr);
      const status = habitLog[dateStr]?.[habitId];

      // Include logs only from start date onwards, IF scheduled AND IF logged
      if (
        logDate &&
        logDate >= startDate &&
        status !== undefined && // Must have a log entry
        isHabitScheduledForDate(habit, logDate) // Must be scheduled
      ) {
        const monthStr = dateStr.substring(0, 7); // YYYY-MM
        if (!monthlyLogs[monthStr]) {
          monthlyLogs[monthStr] = { completed: 0, failed: 0 };
        }

        // Determine success/failure based on log status
        let success = false;
        if (isMeasurable) {
          if (typeof status === "number" && goal !== null && status >= goal) {
            success = true;
          }
        } else {
          if (status === true) {
            success = true;
          }
        }

        if (success) {
          monthlyLogs[monthStr].completed++;
        } else {
          monthlyLogs[monthStr].failed++;
        }
      }
    });

  const labels = Object.keys(monthlyLogs).sort(); // Sorted array of YYYY-MM strings

  if (type === "monthlyBarCompletion") {
    const completedData = labels.map((month) => monthlyLogs[month].completed);
    const failedData = labels.map((month) => monthlyLogs[month].failed);

    return {
      labels,
      datasets: [
        {
          label: habit.type === "bad" ? "Avoided" : "Goal Met / Done",
          data: completedData,
          backgroundColor: "rgba(34, 197, 94, 0.7)", // More opaque green
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 1,
        },
        {
          label: habit.type === "bad" ? "Indulged" : "Missed / Below Goal",
          data: failedData,
          backgroundColor: "rgba(239, 68, 68, 0.7)", // More opaque red
          borderColor: "rgba(220, 38, 38, 1)",
          borderWidth: 1,
        },
      ],
    };
  }
  // Add other chart types ('monthlyBarValue' etc.) here if needed later

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
    overallCompletionRate: 0, // Will be TODAY's rate
    longestStreak: null, // Will be MAX CURRENT streak
    bestHabit: null,
    worstHabit: null, // Will be Needs Focus (recently missed)
  };
  if (!habits || habits.length === 0 || !habitLog) {
    return defaults;
  }

  const NEEDS_FOCUS_MIN_AGE_DAYS = 7; // Min age for "Needs Focus"

  let maxCurrentStreak = { habitTitle: null, length: 0 };
  let habitStatsCache = {}; // Cache results from calculateStats

  // --- Calculate Per-Habit Stats (Current Streak & Rate Info) ---
  habits.forEach((habit) => {
    if (!habit || !habit.id || !habit.startDate) return;

    const stats = calculateStats(habit, habitLog);
    habitStatsCache[habit.id] = stats;

    // Update max current streak
    if (stats.currentStreak > maxCurrentStreak.length) {
      maxCurrentStreak = {
        habitTitle: habit.title,
        length: stats.currentStreak,
      };
    }
  });

  // --- Calculate Overall Completion Rate (TODAY ONLY) ---
  let scheduledToday = 0;
  let completedToday = 0;
  const today = new Date();
  const todayStr = formatDate(today);
  const todayLog = habitLog[todayStr] || {};

  habits.forEach((habit) => {
    if (!habitStatsCache[habit.id]) return; // Skip habits we couldn't get stats for

    if (isHabitScheduledForDate(habit, today)) {
      scheduledToday++;
      const status = todayLog[habit.id];
      let goalMet = false;
      const isMeasurable = habit.isMeasurable || false;
      const goal = isMeasurable ? habit.goal : null;

      if (status !== undefined) {
        if (isMeasurable) {
          goalMet =
            typeof status === "number" && goal !== null && status >= goal;
        } else {
          goalMet = status === true;
        }
      }
      if (goalMet) {
        completedToday++;
      }
    }
  });

  const todaysCompletionRate =
    scheduledToday > 0 ? completedToday / scheduledToday : 0;

  // --- Determine Best and Needs Focus Habits ---
  let bestHabit = null;
  let worstHabit = null; // Renamed to represent "Needs Focus"
  let habitScores = [];

  habits.forEach((habit) => {
    const stats = habitStatsCache[habit.id];
    if (!stats) return; // Skip if stats missing

    // Achievement rate based on historical logged opportunities
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
    });
  });

  if (habitScores.length > 0) {
    // --- Find Best Habit (Highest Achievement Rate) ---
    habitScores.sort((a, b) => {
      // Primary sort: Highest achievement rate
      if (b.achievementRate !== a.achievementRate) {
        return b.achievementRate - a.achievementRate;
      }
      // Secondary sort: Highest current streak
      return b.currentStreak - a.currentStreak;
    });

    // Find the first habit with some positive activity (at least one opportunity)
    const bestCandidate = habitScores.find((h) => h.totalOpportunities > 0);
    if (bestCandidate) {
      bestHabit = {
        title: bestCandidate.title,
        score: bestCandidate.achievementRate, // Score is the achievement rate
      };
    }

    // --- Find "Needs Focus" Habit ---
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - NEEDS_FOCUS_MIN_AGE_DAYS);

    // 1. Filter by age AND current streak being 0
    const needsFocusCandidates = habitScores.filter((habit) => {
      const habitStartDate = parseDate(habit.startDate);
      return (
        habitStartDate &&
        habitStartDate <= cutoffDate &&
        habit.currentStreak === 0
      );
    });

    if (needsFocusCandidates.length > 0) {
      // 2. Sort these candidates by lowest achievement rate (most problematic first)
      needsFocusCandidates.sort((a, b) => {
        if (a.achievementRate !== b.achievementRate) {
          return a.achievementRate - b.achievementRate; // Lower rate is worse
        }
        // Optional tie-breaker: older start date is maybe worse? Or opportunities?
        // Let's stick to rate for now.
        return 0;
      });

      // 3. Select the top one
      worstHabit = {
        title: needsFocusCandidates[0].title,
        score: needsFocusCandidates[0].achievementRate, // Include score for context if needed
      };
    } else {
      // console.log(`No habits eligible for 'Needs Focus' (Older than ${NEEDS_FOCUS_MIN_AGE_DAYS} days with Current Streak = 0).`);
    }
  }

  return {
    overallCompletionRate: todaysCompletionRate, // Use today's rate
    // Use max current streak
    longestStreak: maxCurrentStreak.length > 0 ? maxCurrentStreak : null,
    bestHabit,
    worstHabit, // Represents "Needs Focus"
  };
};

/**
 * Helpers to aggregate completion by week/month for analytics.
 */
const toDateStr = (d) => formatDate(d);

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const aggregateCompletionByWeek = (
  habits,
  habitLog,
  weeks = 12,
  categoryFilter = null
) => {
  const today = new Date();
  const results = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ref = new Date(today);
    ref.setDate(ref.getDate() - i * 7);
    const weekStart = startOfWeek(ref);
    let scheduledTotal = 0;
    let completedTotal = 0;
    for (let d = 0; d < 7; d++) {
      const cur = new Date(weekStart);
      cur.setDate(weekStart.getDate() + d);
      const dateStr = toDateStr(cur);
      const dayLog = habitLog?.[dateStr] || {};
      const scheduledHabits = (habits || []).filter((h) => {
        if (categoryFilter && (h.category || "Uncategorized") !== categoryFilter)
          return false;
        return isHabitScheduledForDate(h, cur);
      });
      const scheduled = scheduledHabits.length;
      if (scheduled === 0) continue;
      scheduledTotal += scheduled;
      scheduledHabits.forEach((habit) => {
        const status = dayLog[habit.id];
        const goalMet = habit.isMeasurable
          ? typeof status === "number" && habit.goal != null && status >= habit.goal
          : status === true;
        if (goalMet) completedTotal++;
      });
    }
    results.push({
      weekStart: toDateStr(weekStart),
      scheduled: scheduledTotal,
      completed: completedTotal,
      rate: scheduledTotal > 0 ? (completedTotal / scheduledTotal) * 100 : 0,
    });
  }
  return results;
};

export const aggregateCompletionByMonth = (
  habits,
  habitLog,
  months = 6,
  categoryFilter = null
) => {
  const today = new Date();
  const results = [];
  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = startOfMonth(ref);
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    let scheduledTotal = 0;
    let completedTotal = 0;
    for (let cur = new Date(monthStart); cur < nextMonth; cur.setDate(cur.getDate() + 1)) {
      const dateStr = toDateStr(cur);
      const dayLog = habitLog?.[dateStr] || {};
      const scheduledHabits = (habits || []).filter((h) => {
        if (categoryFilter && (h.category || "Uncategorized") !== categoryFilter)
          return false;
        return isHabitScheduledForDate(h, cur);
      });
      const scheduled = scheduledHabits.length;
      if (scheduled === 0) continue;
      scheduledTotal += scheduled;
      scheduledHabits.forEach((habit) => {
        const status = dayLog[habit.id];
        const goalMet = habit.isMeasurable
          ? typeof status === "number" && habit.goal != null && status >= habit.goal
          : status === true;
        if (goalMet) completedTotal++;
      });
    }
    results.push({
      month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      scheduled: scheduledTotal,
      completed: completedTotal,
      rate: scheduledTotal > 0 ? (completedTotal / scheduledTotal) * 100 : 0,
    });
  }
  return results;
};

export const findBestWorstWeek = (weeklyAgg) => {
  const valid = (weeklyAgg || []).filter((w) => w.scheduled > 0);
  if (valid.length === 0) return { best: null, worst: null };
  const best = valid.reduce((a, b) => (b.rate > a.rate ? b : a));
  const worst = valid.reduce((a, b) => (b.rate < a.rate ? b : a));
  return { best, worst };
};
