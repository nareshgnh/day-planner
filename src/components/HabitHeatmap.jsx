// src/components/HabitHeatmap.jsx
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Calendar, Flame } from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const HabitHeatmap = ({ habit, habitLog }) => {
  const heatmapData = useMemo(() => {
    // Generate last 12 weeks of data (84 days)
    const weeks = [];
    const today = new Date();

    for (let weekOffset = 11; weekOffset >= 0; weekOffset--) {
      const week = [];
      for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (weekOffset * 7 + dayOffset));

        const dateStr = formatDate(date);
        const isScheduled = isHabitScheduledForDate(habit, date);

        let status = "not-scheduled";
        if (isScheduled) {
          const logEntry = habitLog[dateStr]?.[habit.id];
          if (logEntry === undefined) {
            status = "pending";
          } else if (habit.isMeasurable) {
            status =
              typeof logEntry === "number" &&
              habit.goal &&
              logEntry >= habit.goal
                ? "completed"
                : "partial";
          } else {
            status = logEntry === true ? "completed" : "missed";
          }
        }

        week.push({
          date,
          dateStr,
          status,
          value: logEntry,
        });
      }
      weeks.push(week);
    }

    return weeks;
  }, [habit, habitLog]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-400";
      case "partial":
        return "bg-yellow-400 dark:bg-yellow-300";
      case "missed":
        return "bg-red-300 dark:bg-red-400";
      case "pending":
        return "bg-gray-200 dark:bg-gray-600";
      case "not-scheduled":
        return "bg-gray-50 dark:bg-gray-800";
      default:
        return "bg-gray-100 dark:bg-gray-700";
    }
  };

  const getStatusTitle = (day) => {
    const dateStr = day.date.toLocaleDateString();
    switch (day.status) {
      case "completed":
        return `${dateStr}: Completed ${
          habit.isMeasurable ? `(${day.value}/${habit.goal})` : ""
        }`;
      case "partial":
        return `${dateStr}: Partial completion (${day.value}/${habit.goal})`;
      case "missed":
        return `${dateStr}: Missed`;
      case "pending":
        return `${dateStr}: Pending`;
      case "not-scheduled":
        return `${dateStr}: Not scheduled`;
      default:
        return dateStr;
    }
  };

  const stats = useMemo(() => {
    const scheduledDays = heatmapData
      .flat()
      .filter((day) => day.status !== "not-scheduled");
    const completedDays = scheduledDays.filter(
      (day) => day.status === "completed"
    );
    const partialDays = scheduledDays.filter((day) => day.status === "partial");

    return {
      total: scheduledDays.length,
      completed: completedDays.length,
      partial: partialDays.length,
      completionRate:
        scheduledDays.length > 0
          ? Math.round((completedDays.length / scheduledDays.length) * 100)
          : 0,
    };
  }, [heatmapData]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
          {habit.title} - 12 Week Progress
          <div className="ml-auto flex items-center gap-1 text-sm">
            <Flame size={16} className="text-orange-500" />
            <span className="font-bold text-green-600 dark:text-green-400">
              {stats.completionRate}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Month labels */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          {heatmapData
            .filter((_, i) => i % 4 === 0)
            .map((week, i) => (
              <span key={i}>
                {week[0].date.toLocaleDateString("en-US", { month: "short" })}
              </span>
            ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 mb-4">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 ${getStatusColor(
                    day.status
                  )} border border-gray-200 dark:border-gray-600`}
                  title={getStatusTitle(day)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
              <div className="w-3 h-3 rounded-sm bg-red-300 dark:bg-red-400" />
              <div className="w-3 h-3 rounded-sm bg-yellow-400 dark:bg-yellow-300" />
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400" />
            </div>
            <span>More</span>
          </div>
          <div className="text-right">
            <div>
              {stats.completed} completed, {stats.partial} partial
            </div>
            <div>out of {stats.total} scheduled days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
