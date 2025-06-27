// src/components/HabitCategories.jsx
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Heart,
  Dumbbell,
  Brain,
  Briefcase,
  Home,
  Utensils,
  Moon,
  Book,
} from "lucide-react";
import { HabitListItem } from "./HabitListItem";

const CATEGORY_ICONS = {
  Health: Heart,
  Fitness: Dumbbell,
  Mindfulness: Brain,
  Productivity: Briefcase,
  Home: Home,
  Nutrition: Utensils,
  Sleep: Moon,
  Learning: Book,
  Uncategorized: Plus,
};

const CATEGORY_COLORS = {
  Health: "text-red-500",
  Fitness: "text-green-500",
  Mindfulness: "text-purple-500",
  Productivity: "text-blue-500",
  Home: "text-yellow-500",
  Nutrition: "text-orange-500",
  Sleep: "text-indigo-500",
  Learning: "text-pink-500",
  Uncategorized: "text-gray-500",
};

export const HabitCategoriesView = ({
  habits,
  habitLog,
  selectedDate,
  updateHabitLog,
  openModalForEditHabit,
  handleDeleteHabitCallback,
  selectedHabitIdForStats,
  onSelectHabitForStats,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["Health", "Fitness"])
  );

  const selectedDateStr = useMemo(() => {
    return selectedDate.toISOString().split("T")[0];
  }, [selectedDate]);

  const selectedDayLog = useMemo(
    () => habitLog[selectedDateStr] || {},
    [habitLog, selectedDateStr]
  );

  // Group habits by category
  const groupedHabits = useMemo(() => {
    const groups = {};

    habits.forEach((habit) => {
      const category = habit.category || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(habit);
    });

    // Sort categories by priority and name
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const priority = [
        "Health",
        "Fitness",
        "Mindfulness",
        "Productivity",
        "Learning",
        "Nutrition",
      ];
      const aPriority = priority.indexOf(a);
      const bPriority = priority.indexOf(b);

      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      } else if (aPriority !== -1) {
        return -1;
      } else if (bPriority !== -1) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });

    const result = {};
    sortedCategories.forEach((category) => {
      result[category] = groups[category].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    });

    return result;
  }, [habits]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getCategoryStats = (categoryHabits) => {
    const scheduled = categoryHabits.length;
    let completed = 0;

    categoryHabits.forEach((habit) => {
      const status = selectedDayLog[habit.id];
      const isCompleted = habit.isMeasurable
        ? typeof status === "number" && habit.goal && status >= habit.goal
        : status === true;
      if (isCompleted) completed++;
    });

    return {
      completed,
      scheduled,
      percentage: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
    };
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedHabits).map(([category, categoryHabits]) => {
        const isExpanded = expandedCategories.has(category);
        const stats = getCategoryStats(categoryHabits);
        const Icon = CATEGORY_ICONS[category] || Plus;
        const iconColor = CATEGORY_COLORS[category] || "text-gray-500";

        return (
          <Card key={category} className="bg-white/90 dark:bg-gray-950/90">
            <CardHeader
              className="pb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                  <Icon size={20} className={iconColor} />
                  <CardTitle className="text-lg font-semibold">
                    {category}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {categoryHabits.length}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.completed}/{stats.scheduled}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      stats.percentage === 100
                        ? "text-green-600"
                        : stats.percentage >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.percentage}%
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        stats.percentage === 100
                          ? "bg-green-500"
                          : stats.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {categoryHabits.map((habit) => (
                    <HabitListItem
                      key={habit.id}
                      habit={habit}
                      logStatus={selectedDayLog[habit.id]}
                      selectedDate={selectedDate}
                      isSelected={habit.id === selectedHabitIdForStats}
                      updateHabitLog={updateHabitLog}
                      onEdit={openModalForEditHabit}
                      onDelete={handleDeleteHabitCallback}
                      onSelect={onSelectHabitForStats}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
