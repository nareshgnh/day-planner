// src/components/QuickActionsPanel.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { WeeklyReviewModal } from "./WeeklyReviewModal";
import { VoiceInput } from "./VoiceInput";
import { PhotoCheckIn } from "./PhotoCheckIn";
import {
  Mic,
  Camera,
  Zap,
  Clock,
  MapPin,
  Heart,
  CheckSquare,
  Plus,
  Calendar,
  BarChart3,
} from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

export const QuickActionsPanel = ({
  habits,
  habitLog,
  selectedDate,
  updateHabitLog,
  onBulkComplete,
}) => {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [quickNotes, setQuickNotes] = useState("");
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showPhotoCheckIn, setShowPhotoCheckIn] = useState(false);
  const [selectedHabitForPhoto, setSelectedHabitForPhoto] = useState(null);

  const todayStr = formatDate(selectedDate);
  const todaysHabits = habits.filter((habit) =>
    isHabitScheduledForDate(habit, selectedDate)
  );

  const pendingHabits = todaysHabits.filter((habit) => {
    const status = habitLog[todayStr]?.[habit.id];
    return status === undefined;
  });

  const handleVoiceLogging = () => {
    setShowVoiceInput(true);
  };

  const handleVoiceCommand = (command) => {
    console.log("Processing voice command:", command);

    if (command.action === "complete") {
      if (command.habit.isMeasurable && command.habit.goal) {
        updateHabitLog(command.habit.id, selectedDate, command.habit.goal);
      } else {
        updateHabitLog(command.habit.id, selectedDate, true);
      }
    } else if (command.action === "avoid") {
      updateHabitLog(command.habit.id, selectedDate, false);
    } else if (command.action === "log_value" && command.value) {
      updateHabitLog(command.habit.id, selectedDate, command.value);
    }
  };

  const handlePhotoCheckIn = () => {
    if (pendingHabits.length === 1) {
      setSelectedHabitForPhoto(pendingHabits[0]);
      setShowPhotoCheckIn(true);
    } else if (pendingHabits.length > 1) {
      // Let user select which habit
      alert("Select a habit from the list below for photo check-in");
    } else {
      alert("No pending habits for photo check-in today");
    }
  };

  const handlePhotoSubmit = (photoData) => {
    console.log("Photo submitted:", photoData);

    // Mark the habit as completed when photo is submitted
    if (photoData.habit) {
      if (photoData.habit.isMeasurable && photoData.habit.goal) {
        updateHabitLog(photoData.habit.id, selectedDate, photoData.habit.goal);
      } else {
        updateHabitLog(photoData.habit.id, selectedDate, true);
      }
    }

    // In a real app, you would save the photo to cloud storage
    alert("Photo check-in completed! 📸");
  };

  const handleQuickComplete = (habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit.isMeasurable && habit.goal) {
      updateHabitLog(habitId, selectedDate, habit.goal);
    } else {
      updateHabitLog(habitId, selectedDate, true);
    }
  };

  const handleBulkCompleteAll = () => {
    pendingHabits.forEach((habit) => {
      if (habit.isMeasurable && habit.goal) {
        updateHabitLog(habit.id, selectedDate, habit.goal);
      } else {
        updateHabitLog(habit.id, selectedDate, true);
      }
    });
    onBulkComplete?.(pendingHabits.length);
  };

  const getMotivationalMessage = () => {
    const completedCount = todaysHabits.length - pendingHabits.length;
    const totalCount = todaysHabits.length;

    if (pendingHabits.length === 0) {
      return "🎉 All habits completed! You're crushing it today!";
    } else if (completedCount > totalCount / 2) {
      return `💪 Great progress! ${pendingHabits.length} more to go!`;
    } else if (completedCount > 0) {
      return `⭐ Good start! Keep the momentum going!`;
    } else {
      return `🚀 Ready to start your day? You've got this!`;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Zap size={20} className="text-yellow-500" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          {getMotivationalMessage()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Logging Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleVoiceLogging}
            disabled={isVoiceRecording}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Mic
              size={16}
              className={isVoiceRecording ? "animate-pulse" : ""}
            />
            Voice Log
          </Button>

          <Button
            onClick={handlePhotoCheckIn}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Camera size={16} />
            Photo Check-in
          </Button>
        </div>

        {/* Weekly Review Button */}
        <Button
          onClick={() => setShowWeeklyReview(true)}
          className="w-full flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <BarChart3 size={16} />
          Weekly Review & Insights
        </Button>

        {/* Pending Habits Quick Complete */}
        {pendingHabits.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Complete ({pendingHabits.length} pending)
              </h4>
              {pendingHabits.length > 1 && (
                <Button
                  onClick={handleBulkCompleteAll}
                  size="sm"
                  className="text-xs bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CheckSquare size={14} className="mr-1" />
                  All
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingHabits.slice(0, 5).map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {habit.title}
                  </span>
                  <Button
                    onClick={() => handleQuickComplete(habit.id)}
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={12} />
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedHabitForPhoto(habit);
                      setShowPhotoCheckIn(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs ml-1"
                  >
                    <Camera size={12} />
                  </Button>
                </div>
              ))}
              {pendingHabits.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                  +{pendingHabits.length - 5} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Context Tracking */}
        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context & Mood
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex items-center gap-1"
              onClick={() => alert("Location logging coming soon!")}
            >
              <MapPin size={12} />
              Location
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex items-center gap-1"
              onClick={() => alert("Energy tracking coming soon!")}
            >
              <Zap size={12} />
              Energy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs flex items-center gap-1"
              onClick={() => alert("Mood tracking coming soon!")}
            >
              <Heart size={12} />
              Mood
            </Button>
          </div>
        </div>

        {/* Quick Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Quick Note
          </label>
          <textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            placeholder="How are you feeling today? Any insights?"
            className="w-full p-2 text-sm border rounded resize-none h-16 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
      </CardContent>

      {/* Voice Input Modal */}
      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onCommand={handleVoiceCommand}
        habits={habits}
      />

      {/* Photo Check-in Modal */}
      <PhotoCheckIn
        isOpen={showPhotoCheckIn}
        onClose={() => {
          setShowPhotoCheckIn(false);
          setSelectedHabitForPhoto(null);
        }}
        onPhotoSubmit={handlePhotoSubmit}
        habit={selectedHabitForPhoto}
        selectedDate={selectedDate}
      />

      {/* Weekly Review Modal */}
      <WeeklyReviewModal
        isOpen={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        habits={habits}
        habitLog={habitLog}
      />
    </Card>
  );
};
