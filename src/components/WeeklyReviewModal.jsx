// src/components/WeeklyReviewModal.jsx
import React, { useMemo } from "react";
import { Dialog } from "../ui/Dialog";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Award,
  Lightbulb,
  ChevronRight,
  Star,
} from "lucide-react";
import { calculateStats } from "../utils/stats";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const WeeklyReviewModal = ({ isOpen, onClose, habits, habitLog }) => {
  const weeklyInsights = useMemo(() => {
    if (!habits.length) return null;

    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Generate last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Calculate daily completion rates
    const dailyRates = last7Days.map((date) => {
      const dateStr = formatDate(date);
      const dayLog = habitLog[dateStr] || {};
      const scheduledHabits = habits.filter((h) =>
        isHabitScheduledForDate(h, date)
      );

      if (scheduledHabits.length === 0) return 0;

      let completed = 0;
      scheduledHabits.forEach((habit) => {
        const status = dayLog[habit.id];
        const isCompleted = habit.isMeasurable
          ? typeof status === "number" && habit.goal && status >= habit.goal
          : status === true;
        if (isCompleted) completed++;
      });

      return (completed / scheduledHabits.length) * 100;
    });

    // Calculate habit performance for the week
    const habitPerformance = habits.map((habit) => {
      let weekCompleted = 0;
      let weekScheduled = 0;

      last7Days.forEach((date) => {
        if (isHabitScheduledForDate(habit, date)) {
          weekScheduled++;
          const dateStr = formatDate(date);
          const status = habitLog[dateStr]?.[habit.id];
          const isCompleted = habit.isMeasurable
            ? typeof status === "number" && habit.goal && status >= habit.goal
            : status === true;
          if (isCompleted) weekCompleted++;
        }
      });

      return {
        ...habit,
        weeklyRate:
          weekScheduled > 0 ? (weekCompleted / weekScheduled) * 100 : 0,
        weekCompleted,
        weekScheduled,
      };
    });

    // Find trends
    const averageRate = dailyRates.reduce((sum, rate) => sum + rate, 0) / 7;
    const bestDay = Math.max(...dailyRates);
    const worstDay = Math.min(...dailyRates);
    const bestDayIndex = dailyRates.indexOf(bestDay);
    const worstDayIndex = dailyRates.indexOf(worstDay);

    const topHabits = habitPerformance
      .filter((h) => h.weeklyRate > 80)
      .sort((a, b) => b.weeklyRate - a.weeklyRate);

    const strugglingHabits = habitPerformance
      .filter((h) => h.weeklyRate < 50 && h.weekScheduled > 0)
      .sort((a, b) => a.weeklyRate - b.weeklyRate);

    // Generate insights
    const insights = [];

    if (averageRate >= 80) {
      insights.push({
        type: "success",
        icon: "🎉",
        title: "Outstanding Week!",
        message: `${Math.round(
          averageRate
        )}% completion rate - you're crushing your goals!`,
      });
    } else if (averageRate >= 60) {
      insights.push({
        type: "good",
        icon: "👍",
        title: "Solid Progress",
        message: `${Math.round(
          averageRate
        )}% completion rate - good momentum this week!`,
      });
    } else {
      insights.push({
        type: "improvement",
        icon: "💪",
        title: "Room for Growth",
        message: `${Math.round(
          averageRate
        )}% completion rate - let's aim higher next week!`,
      });
    }

    if (topHabits.length > 0) {
      insights.push({
        type: "strength",
        icon: "⭐",
        title: "Your Strengths",
        message: `${topHabits[0].title} is your star habit with ${Math.round(
          topHabits[0].weeklyRate
        )}% completion!`,
      });
    }

    if (strugglingHabits.length > 0) {
      insights.push({
        type: "focus",
        icon: "🎯",
        title: "Focus Area",
        message: `${strugglingHabits[0].title} needs attention - let's make it easier to stick to!`,
      });
    }

    // Day-of-week insights
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (bestDayIndex !== worstDayIndex) {
      insights.push({
        type: "pattern",
        icon: "📊",
        title: "Weekly Pattern",
        message: `${
          dayNames[bestDayIndex]
        } was your strongest day (${Math.round(bestDay)}%), while ${
          dayNames[worstDayIndex]
        } was toughest (${Math.round(worstDay)}%).`,
      });
    }

    return {
      averageRate,
      dailyRates,
      topHabits,
      strugglingHabits,
      insights,
      bestDay,
      worstDay,
      last7Days,
    };
  }, [habits, habitLog]);

  const getRecommendations = () => {
    if (!weeklyInsights) return [];

    const recommendations = [];

    if (weeklyInsights.strugglingHabits.length > 0) {
      recommendations.push({
        title: "Make it Easier",
        action: `Consider reducing the goal for "${weeklyInsights.strugglingHabits[0].title}" or linking it to an existing routine.`,
      });
    }

    if (weeklyInsights.averageRate < 70) {
      recommendations.push({
        title: "Focus Strategy",
        action:
          "Pick your top 3 most important habits and focus only on those next week.",
      });
    }

    if (weeklyInsights.topHabits.length > 0) {
      recommendations.push({
        title: "Build on Success",
        action: `Use your success with "${weeklyInsights.topHabits[0].title}" as a template for other habits.`,
      });
    }

    recommendations.push({
      title: "Next Week Goal",
      action: `Aim for ${Math.min(
        100,
        Math.round(weeklyInsights.averageRate + 10)
      )}% completion rate - just ${Math.round(10)}% better than this week!`,
    });

    return recommendations;
  };

  if (!weeklyInsights) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Your Weekly Review
            </h2>
            <div className="ml-auto text-lg font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(weeklyInsights.averageRate)}%
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-4 mb-6">
            {weeklyInsights.insights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        {insight.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Top Performers */}
            {weeklyInsights.topHabits.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Award size={18} />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklyInsights.topHabits.slice(0, 3).map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {habit.title}
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {Math.round(habit.weeklyRate)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need Attention */}
            {weeklyInsights.strugglingHabits.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Target size={18} />
                    Need Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklyInsights.strugglingHabits
                      .slice(0, 3)
                      .map((habit) => (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {habit.title}
                          </span>
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {Math.round(habit.weeklyRate)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Lightbulb size={18} />
                Recommendations for Next Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <ChevronRight
                      size={16}
                      className="text-purple-600 dark:text-purple-400 mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                        {rec.title}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                        {rec.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Let's Crush Next Week! 🚀
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
