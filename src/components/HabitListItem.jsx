// src/components/HabitListItem.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button"; // Adjust path
import { Input } from "../ui/Input"; // Adjust path
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Check, // Icon for Log button (measurable)
  MinusCircle, // Icon for Clear button (both types)
  Target, // Icon for goal (measurable)
  // Import an Undo icon if preferred over MinusCircle
  // Undo2
  Flame, // For streak icon
} from "lucide-react";
import { calculateStreak } from "../utils/stats"; // Import calculateStreak

export const HabitListItem = ({
  habit,
  habitLog, // Add habitLog prop
  logStatus, // Can be boolean | number | undefined
  selectedDate,
  isSelected,
  updateHabitLog, // Correct prop name
  onEdit,
  onDelete,
  onSelect,
}) => {
  const isGoodHabit = habit.type !== "bad";
  const isMeasurable = habit.isMeasurable || false;
  const goal = isMeasurable ? habit.goal : null;
  const unit = isMeasurable ? habit.unit || "" : "";

  const { currentStreak } = calculateStreak(habit, habitLog); // Calculate streak

  const [logValueInput, setLogValueInput] = useState("");

  useEffect(() => {
    if (isMeasurable) {
      setLogValueInput(typeof logStatus === "number" ? String(logStatus) : "");
    } else {
      setLogValueInput("");
    }
  }, [logStatus, isMeasurable, selectedDate]);

  // --- Handlers for Non-Measurable ---
  const handleLogBoolean = (e, status) => {
    e.stopPropagation();
    updateHabitLog(habit.id, selectedDate, status);
  };

  // *** ADDED: Handler for clearing boolean log ***
  const handleClearBooleanLog = (e) => {
    e.stopPropagation();
    updateHabitLog(habit.id, selectedDate, null); // Send null to clear
  };
  // *** END ADDED ***

  // --- Handlers for Measurable ---
  const handleLogValue = useCallback(
    (e) => {
      e.stopPropagation();
      const valueStr = logValueInput.trim();
      if (valueStr === "") {
        updateHabitLog(habit.id, selectedDate, null);
        return;
      }
      const numericValue = parseFloat(valueStr);
      if (!isNaN(numericValue) && numericValue >= 0) {
        updateHabitLog(habit.id, selectedDate, numericValue);
      } else {
        alert(
          `Please enter a valid positive number or 0 for ${unit || "value"}.`
        );
      }
    },
    [logValueInput, habit.id, selectedDate, updateHabitLog, unit]
  );

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogValue(e);
    }
  };

  const handleClearMeasurableLog = (e) => {
    e.stopPropagation();
    setLogValueInput(""); // Clear input field visually
    updateHabitLog(habit.id, selectedDate, null); // Send null to delete log in Firestore
  };

  // --- Edit / Delete / Select Handlers ---
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(habit);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${habit.title}"? This cannot be undone.`
      )
    ) {
      onDelete(habit.id);
    }
  }; // Added confirmation
  const handleSelect = () => {
    onSelect(habit.id);
  };

  // --- Determine Display Status & Style ---
  let displayStatus = "";
  let goalMet = false;
  if (isMeasurable) {
    if (typeof logStatus === "number") {
      goalMet = goal !== null && logStatus >= goal;
      displayStatus = `${logStatus} / ${goal ?? "?"} ${unit}`; // Use ??
    } else {
      displayStatus = `Goal: ${goal ?? "?"} ${unit}`; // Use ??
    }
  } else {
    if (logStatus === true) displayStatus = isGoodHabit ? "Done" : "Avoided";
    else if (logStatus === false)
      displayStatus = isGoodHabit ? "Missed" : "Indulged";
    else displayStatus = "Pending";
  }

  const selectedClass = isSelected
    ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500"
    : "bg-white dark:bg-gray-900";

  // --- Render ---
  return (
    <li
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${selectedClass}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
      aria-pressed={isSelected}
    >
      {/* Habit Info (Left side) */}
      <div className="flex items-center gap-2 flex-grow min-w-0 mr-2 pointer-events-none">
        {/* Icon logic remains same */}
        {isMeasurable ? (
          <Target
            size={16}
            className={goalMet ? "text-green-500" : "text-blue-500"}
            flexShrink={0}
          />
        ) : habit.type === "bad" ? (
          <ThumbsDown size={16} className="text-red-500 flex-shrink-0" />
        ) : (
          <ThumbsUp size={16} className="text-green-500 flex-shrink-0" />
        )}
        <div className="flex flex-col">
          <span
            className="font-medium text-sm md:text-base truncate"
            title={habit.title}
          >
            {habit.title}
          </span>
          {/* Status and Streak display */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                typeof logStatus === "number"
                  ? goalMet
                    ? "text-green-600 dark:text-green-400"
                    : "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {displayStatus}
            </span>
            {currentStreak > 0 && (
              <span className="text-xs text-orange-500 dark:text-orange-400 flex items-center">
                <Flame size={12} className="mr-0.5" />
                {currentStreak} day{currentStreak > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Area (Right side) */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
        {/* Conditional Logging UI */}
        {isMeasurable ? (
          // --- UI for Measurable Habits ---
          <>
            <Input
              type="number"
              step="any"
              min="0" // Allow 0
              value={logValueInput}
              onChange={(e) => setLogValueInput(e.target.value)}
              onKeyPress={handleInputKeyPress}
              onClick={(e) => e.stopPropagation()}
              placeholder={`Enter ${unit || "value"}`} // Add value placeholder
              className="h-9 w-24 sm:w-28 px-2 text-sm dark:bg-gray-800"
              aria-label={`Log value for ${habit.title}`}
            />
            <Button
              variant={typeof logStatus === "number" ? "default" : "outline"}
              size="icon"
              onClick={handleLogValue}
              // Use goalMet state for color styling
              className={`h-9 w-9 ${
                typeof logStatus === "number"
                  ? goalMet
                    ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                  : "dark:border-gray-600"
              }`}
              aria-label={`Log ${logValueInput || "value"} for ${habit.title}`}
            >
              <Check size={16} />
            </Button>
            {/* Show clear button only if a value is logged */}
            {typeof logStatus === "number" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearMeasurableLog} // Use specific handler
                className="h-9 w-9 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                aria-label={`Clear log for ${habit.title}`}
              >
                <MinusCircle size={16} />
              </Button>
            )}
          </>
        ) : (
          // --- UI for Non-Measurable Habits ---
          <>
            <Button
              variant={logStatus === true ? "default" : "outline"}
              size="sm" // Keep size small
              onClick={(e) => handleLogBoolean(e, true)}
              // Added min-w-[70px] or similar if text wrapping is issue
              className={`min-w-[70px] justify-center h-9 px-2 sm:px-3 ${
                logStatus === true
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                  : "dark:text-gray-200 dark:border-gray-600"
              }`}
              aria-label={`Mark ${habit.title} as ${
                isGoodHabit ? "Done" : "Avoided"
              }`}
            >
              <CheckCircle size={14} className="mr-1 hidden sm:inline-block" />{" "}
              {isGoodHabit ? "Done" : "Avoided"}
            </Button>
            <Button
              variant={logStatus === false ? "destructive" : "outline"}
              size="sm" // Keep size small
              onClick={(e) => handleLogBoolean(e, false)}
              // Added min-w-[70px] or similar if text wrapping is issue
              className={`min-w-[70px] justify-center h-9 px-2 sm:px-3 ${
                logStatus === false
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                  : "dark:text-gray-200 dark:border-gray-600"
              }`}
              aria-label={`Mark ${habit.title} as ${
                isGoodHabit ? "Missed" : "Indulged"
              }`}
            >
              {isGoodHabit ? (
                <XCircle size={14} className="mr-1 hidden sm:inline-block" />
              ) : (
                <AlertTriangle
                  size={14}
                  className="mr-1 hidden sm:inline-block"
                />
              )}
              {isGoodHabit ? "Missed" : "Indulged"}
            </Button>

            {/* *** ADDED: Clear Button for Non-Measurable *** */}
            {logStatus !== undefined && ( // Only show if logged (true or false)
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearBooleanLog}
                className="h-9 w-9 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400"
                aria-label={`Clear log for ${habit.title}`}
                title="Clear Log" // Tooltip
              >
                <MinusCircle size={16} />
                {/* Or use <Undo2 size={16} /> */}
              </Button>
            )}
            {/* *** END ADDED *** */}
          </>
        )}

        {/* Common Edit/Delete Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 h-9 w-9"
          onClick={handleEdit}
          aria-label={`Edit ${habit.title}`}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 h-9 w-9"
          onClick={handleDelete}
          aria-label={`Delete ${habit.title}`}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </li>
  );
};
