// src/components/PersonalBestsPanel.jsx
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Trophy, Medal, Zap, Target, Calendar, TrendingUp } from "lucide-react";
import { calculateStats } from "../utils/stats";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const PersonalBestsPanel = ({ habits, habitLog }) => {
  const personalBests = useMemo(() => {
    if (!habits.length) return null;

    const allStats = habits.map((habit) => ({
      ...habit,
      ...calculateStats(habit, habitLog),
    }));

    // Calculate global personal bests
    const longestOverallStreak = Math.max(
      ...allStats.map((h) => h.longestStreak || 0)
    );
    const bestCompletionRate = Math.max(
      ...allStats.map((h) =>
        h.totalOpportunities > 0
          ? (h.totalCompleted / h.totalOpportunities) * 100
          : 0
      )
    );

    // Find best habit overall
    const bestHabit = allStats.reduce((best, current) => {
      const currentRate =
        current.totalOpportunities > 0
          ? (current.totalCompleted / current.totalOpportunities) * 100
          : 0;
      const bestRate =
        best.totalOpportunities > 0
          ? (best.totalCompleted / best.totalOpportunities) * 100
          : 0;
      return currentRate > bestRate ? current : best;
    }, allStats[0]);

    // Calculate best week/month performance
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    const dailyCompletions = last30Days.map((date) => {
      const dateStr = formatDate(date);
      const dayLog = habitLog[dateStr] || {};
      const scheduledHabits = habits.filter((h) =>
        isHabitScheduledForDate(h, date)
      );

      let completed = 0;
      scheduledHabits.forEach((habit) => {
        const status = dayLog[habit.id];
        const isCompleted = habit.isMeasurable
          ? typeof status === "number" && habit.goal && status >= habit.goal
          : status === true;
        if (isCompleted) completed++;
      });

      return {
        date: dateStr,
        completed,
        total: scheduledHabits.length,
        rate:
          scheduledHabits.length > 0
            ? (completed / scheduledHabits.length) * 100
            : 0,
      };
    });

    // Find best week (7-day rolling average)
    let bestWeekRate = 0;
    let bestWeekStart = null;
    for (let i = 0; i <= dailyCompletions.length - 7; i++) {
      const weekData = dailyCompletions.slice(i, i + 7);
      const weekRate = weekData.reduce((sum, day) => sum + day.rate, 0) / 7;
      if (weekRate > bestWeekRate) {
        bestWeekRate = weekRate;
        bestWeekStart = weekData[0].date;
      }
    }

    // Personal milestone tracking
    const currentStreaks = allStats.filter((h) => h.currentStreak > 0);
    const activeStreaksCount = currentStreaks.length;
    const totalActiveStreakDays = currentStreaks.reduce(
      (sum, h) => sum + h.currentStreak,
      0
    );

    return {
      longestOverallStreak,
      bestCompletionRate: Math.round(bestCompletionRate),
      bestHabit: bestHabit
        ? {
            title: bestHabit.title,
            rate: Math.round(
              (bestHabit.totalCompleted / bestHabit.totalOpportunities) * 100
            ),
            streak: bestHabit.currentStreak,
          }
        : null,
      bestWeekRate: Math.round(bestWeekRate),
      bestWeekStart,
      activeStreaksCount,
      totalActiveStreakDays,
      totalHabitsCount: habits.length,
      milestones: getMilestones(allStats),
    };
  }, [habits, habitLog]);

  const getMilestones = (stats) => {
    const milestones = [];

    // Streak milestones
    stats.forEach((habit) => {
      if (habit.currentStreak >= 100)
        milestones.push({
          type: "streak",
          habit: habit.title,
          value: 100,
          icon: "💯",
        });
      else if (habit.currentStreak >= 50)
        milestones.push({
          type: "streak",
          habit: habit.title,
          value: 50,
          icon: "🔥",
        });
      else if (habit.currentStreak >= 30)
        milestones.push({
          type: "streak",
          habit: habit.title,
          value: 30,
          icon: "⚡",
        });
      else if (habit.currentStreak >= 7)
        milestones.push({
          type: "streak",
          habit: habit.title,
          value: 7,
          icon: "⭐",
        });
    });

    // Completion milestones
    stats.forEach((habit) => {
      const rate =
        habit.totalOpportunities > 0
          ? (habit.totalCompleted / habit.totalOpportunities) * 100
          : 0;
      if (rate === 100 && habit.totalOpportunities >= 30) {
        milestones.push({
          type: "perfect",
          habit: habit.title,
          value: "100%",
          icon: "🏆",
        });
      } else if (rate >= 90 && habit.totalOpportunities >= 20) {
        milestones.push({
          type: "excellent",
          habit: habit.title,
          value: "90%+",
          icon: "🥇",
        });
      }
    });

    return milestones.slice(0, 6); // Show top 6 milestones
  };

  if (!personalBests) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500 dark:text-gray-400">
          Complete some habits to see your personal bests!
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, colorClass }) => (
    <div className={`p-4 rounded-lg ${colorClass} text-center`}>
      <Icon size={24} className="mx-auto mb-2 text-white" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/90 font-medium">{title}</div>
      {subtitle && <div className="text-xs text-white/70 mt-1">{subtitle}</div>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          Personal Bests & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Achievements Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Zap}
            title="Longest Streak"
            value={`${personalBests.longestOverallStreak} days`}
            colorClass="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <StatCard
            icon={Target}
            title="Best Completion"
            value={`${personalBests.bestCompletionRate}%`}
            subtitle="All-time high"
            colorClass="bg-gradient-to-br from-green-500 to-emerald-500"
          />
          <StatCard
            icon={Calendar}
            title="Best Week"
            value={`${personalBests.bestWeekRate}%`}
            subtitle={
              personalBests.bestWeekStart
                ? new Date(personalBests.bestWeekStart).toLocaleDateString()
                : ""
            }
            colorClass="bg-gradient-to-br from-blue-500 to-indigo-500"
          />
          <StatCard
            icon={Medal}
            title="Active Streaks"
            value={personalBests.activeStreaksCount}
            subtitle={`${personalBests.totalActiveStreakDays} total days`}
            colorClass="bg-gradient-to-br from-purple-500 to-pink-500"
          />
        </div>

        {/* Best Habit Spotlight */}
        {personalBests.bestHabit && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center gap-3">
              <Trophy
                size={20}
                className="text-yellow-600 dark:text-yellow-400"
              />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  🏆 Top Performing Habit
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">
                    {personalBests.bestHabit.title}
                  </span>{" "}
                  - {personalBests.bestHabit.rate}% completion
                  {personalBests.bestHabit.streak > 0 && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                      🔥 {personalBests.bestHabit.streak} day streak
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Milestones */}
        {personalBests.milestones.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Medal size={18} className="text-blue-600 dark:text-blue-400" />
              Recent Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personalBests.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-2xl">{milestone.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      {milestone.habit}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {milestone.type === "streak" &&
                        `${milestone.value} day streak`}
                      {milestone.type === "perfect" &&
                        "Perfect completion rate"}
                      {milestone.type === "excellent" &&
                        `${milestone.value} completion rate`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
