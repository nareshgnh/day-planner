// src/components/HabitModal.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import { Input } from "../ui/Input"; // Adjust path
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup"; // Adjust path
import { formatDate } from "../utils/helpers"; // Adjust path

export const HabitModal = ({
  isOpen,
  onClose,
  editingHabit,
  habitData, // Contains title, type, startDate, endDate
  onDataChange, // Function to update habitData state in App.jsx
  onSave,
}) => {
  // Directly use and update props passed from App.jsx
  const { title, type, startDate, endDate } = habitData;

  const handleInputChange = (field, value) => {
    onDataChange({ ...habitData, [field]: value });
  };

  const handleTypeChange = (value) => {
    onDataChange({ ...habitData, type: value });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingHabit ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-4">
            {/* Habit Title Input */}
            <div>
              <label
                htmlFor="habit-title-modal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="habit-title-modal"
                value={title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="E.g., Exercise daily, Avoid snacks"
                className="w-full"
                autoFocus
                required
                maxLength={100}
              />
            </div>
            {/* Habit Type Radio Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habit Type
              </label>
              <RadioGroup
                value={type}
                onValueChange={handleTypeChange} // Use the handler
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="type-good" />
                  <label
                    htmlFor="type-good"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Build Good Habit
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bad" id="type-bad" />
                  <label
                    htmlFor="type-bad"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Break Bad Habit
                  </label>
                </div>
              </RadioGroup>
            </div>
            {/* Start and End Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="habit-start-modal"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="habit-start-modal"
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full"
                  required
                  max={formatDate(
                    new Date(new Date().getFullYear() + 10, 11, 31)
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor="habit-end-modal"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  End Date <span className="text-xs">(Optional)</span>
                </label>
                <Input
                  id="habit-end-modal"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full"
                  min={startDate || undefined}
                  max={formatDate(
                    new Date(new Date().getFullYear() + 20, 11, 31)
                  )}
                />
              </div>
            </div>
          </div>
          {/* Modal Footer with Buttons */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
            >
              {editingHabit ? "Save Changes" : "Add Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
