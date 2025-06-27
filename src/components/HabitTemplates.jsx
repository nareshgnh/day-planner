// src/components/HabitTemplates.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  Droplets,
  Dumbbell,
  Book,
  Moon,
  Apple,
  Cigarette,
  Smartphone,
  Coffee,
  Clock,
  Heart,
  Brain,
  Zap,
} from "lucide-react";

const HABIT_TEMPLATES = [
  // Health & Fitness
  {
    id: "drink_water",
    title: "Drink Water",
    type: "good",
    category: "Health",
    icon: Droplets,
    isMeasurable: true,
    unit: "glasses",
    goal: 8,
    scheduleType: "daily",
    description: "Stay hydrated throughout the day",
    color: "blue",
  },
  {
    id: "exercise",
    title: "Exercise",
    type: "good",
    category: "Fitness",
    icon: Dumbbell,
    isMeasurable: true,
    unit: "minutes",
    goal: 30,
    scheduleType: "daily",
    description: "Daily physical activity",
    color: "green",
  },
  {
    id: "sleep_early",
    title: "Sleep by 10 PM",
    type: "good",
    category: "Health",
    icon: Moon,
    isMeasurable: false,
    scheduleType: "daily",
    description: "Maintain a healthy sleep schedule",
    color: "purple",
  },
  {
    id: "eat_vegetables",
    title: "Eat Vegetables",
    type: "good",
    category: "Nutrition",
    icon: Apple,
    isMeasurable: true,
    unit: "servings",
    goal: 5,
    scheduleType: "daily",
    description: "Get your daily dose of nutrients",
    color: "green",
  },

  // Productivity & Learning
  {
    id: "read_books",
    title: "Read Books",
    type: "good",
    category: "Learning",
    icon: Book,
    isMeasurable: true,
    unit: "pages",
    goal: 10,
    scheduleType: "daily",
    description: "Expand your knowledge daily",
    color: "indigo",
  },
  {
    id: "meditation",
    title: "Meditation",
    type: "good",
    category: "Mindfulness",
    icon: Brain,
    isMeasurable: true,
    unit: "minutes",
    goal: 10,
    scheduleType: "daily",
    description: "Practice mindfulness and reduce stress",
    color: "purple",
  },
  {
    id: "gratitude_journal",
    title: "Gratitude Journal",
    type: "good",
    category: "Mindfulness",
    icon: Heart,
    isMeasurable: true,
    unit: "entries",
    goal: 3,
    scheduleType: "daily",
    description: "Write down things you're grateful for",
    color: "pink",
  },

  // Bad Habits to Break
  {
    id: "no_smoking",
    title: "Avoid Smoking",
    type: "bad",
    category: "Health",
    icon: Cigarette,
    isMeasurable: false,
    scheduleType: "daily",
    description: "Stay smoke-free for better health",
    color: "red",
  },
  {
    id: "limit_social_media",
    title: "Limit Social Media",
    type: "bad",
    category: "Digital Wellness",
    icon: Smartphone,
    isMeasurable: true,
    unit: "minutes",
    goal: 30, // Goal is the maximum allowed
    scheduleType: "daily",
    description: "Reduce mindless scrolling",
    color: "orange",
  },
  {
    id: "no_late_coffee",
    title: "No Coffee After 2 PM",
    type: "bad",
    category: "Health",
    icon: Coffee,
    isMeasurable: false,
    scheduleType: "daily",
    description: "Better sleep by avoiding late caffeine",
    color: "amber",
  },

  // Weekly habits
  {
    id: "weekly_review",
    title: "Weekly Review",
    type: "good",
    category: "Productivity",
    icon: Clock,
    isMeasurable: false,
    scheduleType: "specific_days",
    scheduleDays: [0], // Sunday
    description: "Reflect on the week and plan ahead",
    color: "gray",
  },
];

const CATEGORIES = [
  "All",
  "Health",
  "Fitness",
  "Nutrition",
  "Learning",
  "Mindfulness",
  "Productivity",
  "Digital Wellness",
];

const HabitTemplates = ({ onSelectTemplate, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTemplates =
    selectedCategory === "All"
      ? HABIT_TEMPLATES
      : HABIT_TEMPLATES.filter(
          (template) => template.category === selectedCategory
        );

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      indigo:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      orange:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      amber:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colorMap[color] || colorMap.gray;
  };

  const handleSelectTemplate = (template) => {
    const habitData = {
      title: template.title,
      type: template.type,
      category: template.category,
      isMeasurable: template.isMeasurable,
      unit: template.unit || "",
      goal: template.goal || null,
      scheduleType: template.scheduleType || "daily",
      scheduleDays: template.scheduleDays || [],
      scheduleFrequency: template.scheduleFrequency || null,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    };

    onSelectTemplate(habitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Choose a Habit Template
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start with a proven habit template to get going quickly
          </p>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-700"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-2 rounded-lg ${getColorClasses(
                          template.color
                        )}`}
                      >
                        <Icon size={20} />
                      </div>
                      <Badge
                        variant={
                          template.type === "bad" ? "destructive" : "default"
                        }
                        className="text-xs"
                      >
                        {template.type === "bad" ? "Break" : "Build"}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {template.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>

                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>Category: {template.category}</div>
                      {template.isMeasurable && (
                        <div>
                          Goal: {template.goal} {template.unit}
                        </div>
                      )}
                      <div>
                        Schedule:{" "}
                        {template.scheduleType === "daily"
                          ? "Daily"
                          : template.scheduleType === "specific_days"
                          ? "Specific Days"
                          : "Frequency Based"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 text-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitTemplates;
