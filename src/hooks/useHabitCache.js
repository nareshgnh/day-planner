// src/hooks/useHabitCache.js
import { useState, useEffect, useMemo } from "react";
import { calculateStats } from "../utils/stats";
import { isHabitScheduledForDate } from "../utils/helpers";

// Helper functions for habit calculations
const calculateCompletionRate = (habit, habitLog) => {
  const stats = calculateStats(habit, habitLog);
  return stats.totalOpportunities > 0
    ? (stats.totalCompleted / stats.totalOpportunities) * 100
    : 0;
};

const calculateCurrentStreak = (habit, habitLog) => {
  const stats = calculateStats(habit, habitLog);
  return stats.currentStreak || 0;
};

// Custom hook for caching and optimizing habit data
export const useHabitCache = (habits, habitLog) => {
  const [cache, setCache] = useState({});

  // Memoized calculations to avoid recalculating on every render
  const memoizedData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return {
      todayHabits: habits.filter((habit) =>
        isHabitScheduledForDate(habit, today)
      ),
      completionRates: habits.map((habit) => ({
        id: habit.id,
        rate: calculateCompletionRate(habit, habitLog),
      })),
      streakData: habits.map((habit) => ({
        id: habit.id,
        streak: calculateCurrentStreak(habit, habitLog),
      })),
    };
  }, [habits, habitLog]);

  // Cache expensive calculations
  useEffect(() => {
    const newCache = {};

    habits.forEach((habit) => {
      if (
        !cache[habit.id] ||
        cache[habit.id].lastUpdated < Date.now() - 60000
      ) {
        // Cache for 1 minute
        newCache[habit.id] = {
          stats: calculateStats(habit, habitLog),
          lastUpdated: Date.now(),
        };
      } else {
        newCache[habit.id] = cache[habit.id];
      }
    });

    setCache(newCache);
  }, [habits, habitLog]);

  return { memoizedData, cache };
};
