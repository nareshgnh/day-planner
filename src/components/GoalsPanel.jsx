// src/components/GoalsPanel.jsx
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Flame,
} from "lucide-react";
import { calculateStats } from "../utils/stats";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

const MILESTONE_TYPES = [
  { id: "streak", name: "Streak Goals", icon: Flame, color: "orange" },
  {
    id: "completion",
    name: "Completion Goals",
    icon: CheckCircle,
    color: "green",
  },
  {
    id: "consistency",
    name: "Consistency Goals",
    icon: Calendar,
    color: "blue",
  },
  { id: "total", name: "Total Goals", icon: Trophy, color: "purple" },
];

const PREDEFINED_GOALS = [
  // Streak Goals
  {
    type: "streak",
    title: "7-Day Streak",
    target: 7,
    description: "Complete habit for 7 days in a row",
  },
  {
    type: "streak",
    title: "30-Day Streak",
    target: 30,
    description: "Complete habit for 30 days in a row",
  },
  {
    type: "streak",
    title: "100-Day Streak",
    target: 100,
    description: "Complete habit for 100 days in a row",
  },

  // Completion Goals
  {
    type: "completion",
    title: "Perfect Week",
    target: 100,
    timeframe: "week",
    description: "100% completion rate for a week",
  },
  {
    type: "completion",
    title: "Perfect Month",
    target: 100,
    timeframe: "month",
    description: "100% completion rate for a month",
  },

  // Consistency Goals
  {
    type: "consistency",
    title: "Consistent Performer",
    target: 80,
    timeframe: "month",
    description: "Maintain 80%+ completion rate for a month",
  },

  // Total Goals
  {
    type: "total",
    title: "Century Club",
    target: 100,
    description: "Complete habit 100 times total",
  },
  {
    type: "total",
    title: "Champion",
    target: 365,
    description: "Complete habit 365 times total",
  },
];

export const GoalsPanel = ({ habits, habitLog, selectedHabitId }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState("streak");

  const selectedHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId);
  }, [habits, selectedHabitId]);

  const habitStats = useMemo(() => {
    if (!selectedHabit) return null;
    return calculateStats(selectedHabit, habitLog);
  }, [selectedHabit, habitLog]);

  const habitGoals = useMemo(() => {
    if (!selectedHabit) return [];
    return selectedHabit.goals || [];
  }, [selectedHabit]);

  const calculateGoalProgress = (goal, habit, stats) => {
    switch (goal.type) {
      case "streak":
        return {
          current: stats.currentStreak,
          target: goal.target,
          progress: Math.min((stats.currentStreak / goal.target) * 100, 100),
          completed: stats.currentStreak >= goal.target,
        };

      case "completion":
        // Calculate completion rate for the specified timeframe
        const rate = calculateCompletionRateForTimeframe(
          habit,
          habitLog,
          goal.timeframe
        );
        return {
          current: Math.round(rate),
          target: goal.target,
          progress: Math.min((rate / goal.target) * 100, 100),
          completed: rate >= goal.target,
        };

      case "total":
        return {
          current: stats.totalCompleted,
          target: goal.target,
          progress: Math.min((stats.totalCompleted / goal.target) * 100, 100),
          completed: stats.totalCompleted >= goal.target,
        };

      default:
        return {
          current: 0,
          target: goal.target,
          progress: 0,
          completed: false,
        };
    }
  };

  const calculateCompletionRateForTimeframe = (habit, habitLog, timeframe) => {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    let scheduledDays = 0;
    let completedDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      if (isHabitScheduledForDate(habit, currentDate)) {
        scheduledDays++;
        const dateStr = formatDate(currentDate);
        const status = habitLog[dateStr]?.[habit.id];

        const isCompleted = habit.isMeasurable
          ? typeof status === "number" && habit.goal && status >= habit.goal
          : status === true;

        if (isCompleted) completedDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return scheduledDays > 0 ? (completedDays / scheduledDays) * 100 : 0;
  };

  const addGoalToHabit = (goalTemplate) => {
    // This would update the habit with a new goal
    // Implementation would depend on your data structure
    console.log("Adding goal to habit:", goalTemplate);
    setShowAddGoal(false);
  };

  if (!selectedHabit || !habitStats) {
    return (
      <Card className="bg-white/90 dark:bg-gray-950/90">
        <CardContent className="pt-6 text-center text-gray-500 dark:text-gray-400">
          Select a habit to see its goals and milestones
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/90 dark:bg-gray-950/90">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-indigo-500" />
              Goals & Milestones
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddGoal(true)}
              className="text-xs"
            >
              <Plus size={14} className="mr-1" />
              Add Goal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habitGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>No goals set for this habit yet.</p>
              <Button
                variant="outline"
                onClick={() => setShowAddGoal(true)}
                className="mt-2"
              >
                Set Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {habitGoals.map((goal, index) => {
                const progress = calculateGoalProgress(
                  goal,
                  selectedHabit,
                  habitStats
                );
                const goalType = MILESTONE_TYPES.find(
                  (t) => t.id === goal.type
                );
                const Icon = goalType?.icon || Target;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      progress.completed
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={16}
                          className={`text-${goalType?.color}-500`}
                        />
                        <span className="font-medium">{goal.title}</span>
                        {progress.completed && (
                          <Badge variant="success" className="text-xs">
                            Completed! 🎉
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {progress.current}/{progress.target}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {goal.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.completed
                              ? "bg-green-500"
                              : "bg-indigo-500"
                          }`}
                          style={{
                            width: `${Math.min(progress.progress, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card className="bg-white/90 dark:bg-gray-950/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {habitStats.currentStreak}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Current Streak
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {habitStats.totalCompleted}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Total Completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold">Add New Goal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose a goal for {selectedHabit.title}
              </p>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Goal Type Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {MILESTONE_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={
                      selectedGoalType === type.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedGoalType(type.id)}
                    className="text-xs"
                  >
                    <type.icon size={14} className="mr-1" />
                    {type.name}
                  </Button>
                ))}
              </div>

              {/* Goal Templates */}
              <div className="space-y-2">
                {PREDEFINED_GOALS.filter(
                  (goal) => goal.type === selectedGoalType
                ).map((goal, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                    onClick={() => addGoalToHabit(goal)}
                  >
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
