// src/components/TodaysHabitsPanel.jsx
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  CheckCircle,
  Circle,
  Clock,
  Plus,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const TodaysHabitsPanel = ({
  habits,
  habitLog,
  updateHabitLog,
  openModalForNewHabit,
}) => {
  const [measurableInputs, setMeasurableInputs] = useState({});

  // Calculate today's habits data
  const todaysHabitsData = useMemo(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    const todaysLog = habitLog[todayStr] || {};
    const todaysHabits = habits.filter((habit) =>
      isHabitScheduledForDate(habit, today)
    );

    const completed = todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      if (habit.isBadHabit) {
        return status === "avoided";
      }
      return habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;
    });

    const pending = todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      if (habit.isBadHabit) {
        return status !== "avoided";
      }
      return habit.isMeasurable
        ? !(typeof status === "number" && habit.goal && status >= habit.goal)
        : status !== true;
    });

    return {
      todayStr,
      todaysHabits,
      completed,
      pending,
      completionPercentage:
        todaysHabits.length > 0
          ? Math.round((completed.length / todaysHabits.length) * 100)
          : 0,
    };
  }, [habits, habitLog]);

  const handleQuickComplete = (habit) => {
    if (habit.isBadHabit) {
      updateHabitLog(todaysHabitsData.todayStr, habit.id, "avoided");
    } else if (habit.isMeasurable) {
      const inputValue = measurableInputs[habit.id];
      const value = inputValue ? parseInt(inputValue, 10) : habit.goal;
      updateHabitLog(todaysHabitsData.todayStr, habit.id, value);
      setMeasurableInputs((prev) => ({ ...prev, [habit.id]: "" }));
    } else {
      updateHabitLog(todaysHabitsData.todayStr, habit.id, true);
    }
  };

  const handleMarkMissed = (habit) => {
    if (habit.isBadHabit) {
      updateHabitLog(todaysHabitsData.todayStr, habit.id, "indulged");
    } else {
      updateHabitLog(todaysHabitsData.todayStr, habit.id, false);
    }
  };

  const handleMeasurableInputChange = (habitId, value) => {
    setMeasurableInputs((prev) => ({ ...prev, [habitId]: value }));
  };

  const { todaysHabits, completed, pending, completionPercentage } =
    todaysHabitsData;
  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Today's Habits
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              onClick={openModalForNewHabit}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Habit
            </Button>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {completionPercentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                Complete
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {completed.length}/{todaysHabits.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                Done
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {pending.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pending ({pending.length})
            </h4>
            {pending.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:shadow-sm transition-shadow"
              >
                <Circle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                    {habit.title}
                  </div>
                  {habit.isMeasurable && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Goal: {habit.goal} {habit.unit}
                    </div>
                  )}
                  {habit.isBadHabit && (
                    <div className="text-xs text-red-500 dark:text-red-400">
                      Bad habit - Try to avoid
                    </div>
                  )}
                </div>
                {habit.isMeasurable && !habit.isBadHabit ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={`0-${habit.goal}`}
                      value={measurableInputs[habit.id] || ""}
                      onChange={(e) =>
                        handleMeasurableInputChange(habit.id, e.target.value)
                      }
                      className="w-20 h-7 text-xs"
                      min="0"
                      max={habit.goal}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleQuickComplete(habit)}
                      className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                      disabled={!measurableInputs[habit.id] && !habit.goal}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkMissed(habit)}
                      className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickComplete(habit)}
                      className={`h-7 px-3 text-xs ${
                        habit.isBadHabit
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {habit.isBadHabit ? "Avoided" : "Done"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkMissed(habit)}
                      className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {habit.isBadHabit ? "Indulged" : "Missed"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Completed ({completed.length}) 🎉
            </h4>
            {completed.map((habit) => {
              const status = habitLog[todaysHabitsData.todayStr]?.[habit.id];
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {habit.title}
                    </div>
                    {habit.isMeasurable && typeof status === "number" && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Completed: {status}/{habit.goal} {habit.unit}
                      </div>
                    )}
                    {habit.isBadHabit && status === "avoided" && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Successfully avoided!
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                    {habit.isBadHabit ? "✓ AVOIDED" : "✓ DONE"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {todaysHabits.length === 0 && (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Habits Today
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You have no habits scheduled for today. Ready to add one?
            </p>
            <Button
              onClick={openModalForNewHabit}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
