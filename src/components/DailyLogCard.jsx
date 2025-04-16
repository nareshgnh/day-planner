// src/components/DailyLogCard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import { formatDate } from "../utils/helpers"; // Adjust path
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export const DailyLogCard = ({
  selectedDate,
  activeHabitsForSelectedDate,
  habitLog,
  setHabitCompletionStatus,
}) => {
  const formattedDate = formatDate(selectedDate);

  return (
    <Card className="bg-white/90 dark:bg-gray-950/90">
      <CardHeader>
        <CardTitle className="text-lg">
          Log for {formattedDate || "Selected Date"}
        </CardTitle>
      </CardHeader>
      {/* Internal scroll for long lists */}
      <CardContent className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {activeHabitsForSelectedDate.length > 0 ? (
          <ul className="space-y-3">
            {activeHabitsForSelectedDate.map((habit) => {
              const logStatus = habitLog[formattedDate]?.[habit.id];
              const isGoodHabit = habit.type !== "bad";
              const doneText = isGoodHabit ? "Done" : "Avoided";
              const missedText = isGoodHabit ? "Missed" : "Indulged";
              const doneIcon = <CheckCircle size={16} className="mr-1" />;
              const missedIcon = isGoodHabit ? (
                <XCircle size={16} className="mr-1" />
              ) : (
                <AlertTriangle size={16} className="mr-1 text-orange-500" />
              );

              return (
                <li
                  key={habit.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 gap-2"
                >
                  {/* Habit Title and Type Indicator */}
                  <span className="font-medium text-sm md:text-base flex items-center gap-2 flex-grow min-w-0 mr-2">
                    {habit.type === "bad" ? (
                      <ThumbsDown
                        size={14}
                        className="text-red-500 flex-shrink-0"
                      />
                    ) : (
                      <ThumbsUp
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{habit.title}</span>
                  </span>
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
                    {/* Done/Avoided Button */}
                    <Button
                      variant={logStatus === true ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setHabitCompletionStatus(habit.id, selectedDate, true)
                      }
                      className={`w-24 justify-center ${
                        logStatus === true
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                          : "dark:text-gray-200 dark:border-gray-600"
                      }`}
                      aria-label={`Mark ${habit.title} as ${doneText}`}
                    >
                      {doneIcon} {doneText}
                    </Button>
                    {/* Missed/Indulged Button */}
                    <Button
                      variant={logStatus === false ? "destructive" : "outline"}
                      size="sm"
                      onClick={() =>
                        setHabitCompletionStatus(habit.id, selectedDate, false)
                      }
                      className={`w-24 justify-center ${
                        logStatus === false
                          ? "bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                          : "dark:text-gray-200 dark:border-gray-600"
                      }`}
                      aria-label={`Mark ${habit.title} as ${missedText}`}
                    >
                      {missedIcon} {missedText}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            No habits scheduled for this date.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
