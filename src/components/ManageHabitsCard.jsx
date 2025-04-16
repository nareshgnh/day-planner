// src/components/ManageHabitsCard.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import {
  Settings,
  Info,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
} from "lucide-react";

export const ManageHabitsCard = ({
  habits,
  openModalForEditHabit,
  handleDeleteHabitCallback,
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col">
      {" "}
      {/* Removed flex-grow */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings size={20} className="text-gray-600 dark:text-gray-400" />
          Manage Habits
        </CardTitle>
      </CardHeader>
      {/* Internal scroll for long lists, keep pb-20 for spacing */}
      <CardContent className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-[calc(100vh-35rem)] pb-20">
        {habits.length > 0 ? (
          <ul className="space-y-2">
            {habits.map((habit) => (
              <li
                key={habit.id}
                className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 group bg-white dark:bg-gray-900"
              >
                {/* Habit Info */}
                <div className="flex items-center space-x-2 text-sm flex-grow min-w-0 mr-1">
                  {habit.type === "bad" ? (
                    <ThumbsDown
                      size={16}
                      className="text-red-500 flex-shrink-0"
                    />
                  ) : (
                    <ThumbsUp
                      size={16}
                      className="text-green-500 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium block truncate">
                      {habit.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      {habit.startDate} to {habit.endDate || "Ongoing"}
                    </span>
                  </div>
                </div>
                {/* Action Buttons (Edit/Delete) */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 h-7 w-7"
                    onClick={() => openModalForEditHabit(habit)}
                    aria-label={`Edit habit ${habit.title}`}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 h-7 w-7"
                    onClick={() => handleDeleteHabitCallback(habit.id)}
                    aria-label={`Delete habit ${habit.title}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 flex flex-col items-center gap-2">
            <Info size={24} />
            <span>No habits defined yet.</span>
            <span>Click "Add New Habit" or ask the AI!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
