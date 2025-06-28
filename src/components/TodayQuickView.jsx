// src/components/TodayQuickView.jsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { CheckCircle, Circle, Clock, Target, Plus } from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const TodayQuickView = ({
  habits,
  habitLog,
  updateHabitLog,
  openModalForNewHabit,
}) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const todaysLog = habitLog[todayStr] || {};

  const todaysHabits = useMemo(() => {
    return habits.filter((habit) => isHabitScheduledForDate(habit, today));
  }, [habits, today]);

  const completedHabits = useMemo(() => {
    return todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      return habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;
    });
  }, [todaysHabits, todaysLog]);

  const pendingHabits = useMemo(() => {
    return todaysHabits.filter((habit) => {
      const status = todaysLog[habit.id];
      return habit.isMeasurable
        ? !(typeof status === "number" && habit.goal && status >= habit.goal)
        : status !== true;
    });
  }, [todaysHabits, todaysLog]);

  const handleQuickComplete = (habit) => {
    const newStatus = habit.isMeasurable ? habit.goal : true;
    updateHabitLog(todayStr, habit.id, newStatus);
  };

  if (todaysHabits.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
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
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = Math.round(
    (completedHabits.length / todaysHabits.length) * 100
  );

  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Today's Quick Actions
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({completedHabits.length}/{todaysHabits.length} complete)
          </span>
        </CardTitle>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {pendingHabits.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pending ({pendingHabits.length})
            </h4>
            {pendingHabits.slice(0, 3).map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              >
                <Circle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {habit.title}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickComplete(habit)}
                  className="h-6 px-2 text-xs border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                >
                  Done
                </Button>
              </div>
            ))}
            {pendingHabits.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{pendingHabits.length - 3} more habits...
              </p>
            )}
          </div>
        )}

        {completedHabits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Completed ({completedHabits.length})
            </h4>
            {completedHabits.slice(0, 2).map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {habit.title}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓
                </span>
              </div>
            ))}
            {completedHabits.length > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{completedHabits.length - 2} more completed
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
