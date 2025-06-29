// src/components/ChallengesPanel.jsx
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Target,
  Calendar,
  Trophy,
  Timer,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
} from "lucide-react";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";

const ChallengesPanel = ({
  habits,
  habitLog,
  onStartChallenge,
  activeChallenges = [],
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Predefined challenges
  const challengeTemplates = [
    {
      id: "perfect_week",
      name: "7-Day Perfect Week",
      description: "Complete all your habits for 7 consecutive days",
      duration: 7,
      type: "streak",
      difficulty: "medium",
      reward: 200,
      icon: Calendar,
    },
    {
      id: "habit_starter",
      name: "Habit Starter",
      description: "Complete any single habit for 3 days in a row",
      duration: 3,
      type: "single_habit",
      difficulty: "easy",
      reward: 50,
      icon: Play,
    },
    {
      id: "consistency_master",
      name: "Consistency Master",
      description: "Maintain 80% completion rate for 30 days",
      duration: 30,
      type: "percentage",
      targetPercentage: 80,
      difficulty: "hard",
      reward: 500,
      icon: Target,
    },
    {
      id: "habit_stacker",
      name: "Habit Stacker",
      description: "Complete 3 different habits in a single day",
      duration: 1,
      type: "multiple_habits",
      targetCount: 3,
      difficulty: "medium",
      reward: 100,
      icon: Zap,
    },
    {
      id: "month_warrior",
      name: "Month Warrior",
      description: "Complete all habits for an entire month",
      duration: 30,
      type: "perfect_month",
      difficulty: "legendary",
      reward: 1000,
      icon: Trophy,
    },
    {
      id: "comeback_kid",
      name: "Comeback Kid",
      description: "Get back on track after missing a day",
      duration: 2,
      type: "recovery",
      difficulty: "easy",
      reward: 75,
      icon: RotateCcw,
    },
  ];

  // Calculate challenge progress
  const challengeProgress = useMemo(() => {
    const progress = {};

    activeChallenges.forEach((challenge) => {
      const template = challengeTemplates.find(
        (t) => t.id === challenge.templateId
      );
      if (!template) return;

      const startDate = new Date(challenge.startDate);
      const today = new Date();
      const daysPassed = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24)
      );

      let completed = 0;
      let total = template.duration;
      let isCompleted = false;

      // Calculate progress based on challenge type
      switch (template.type) {
        case "streak":
        case "perfect_month":
          // Check consecutive perfect days
          for (
            let i = 0;
            i < Math.min(daysPassed + 1, template.duration);
            i++
          ) {
            const checkDate = new Date(startDate);
            checkDate.setDate(checkDate.getDate() + i);
            const dateStr = formatDate(checkDate);
            const dayLog = habitLog[dateStr] || {};

            const scheduledHabits = habits.filter((h) =>
              isHabitScheduledForDate(h, checkDate)
            );
            const completedHabits = scheduledHabits.filter((h) => {
              const status = dayLog[h.id];
              return h.isMeasurable
                ? typeof status === "number" && status >= (h.goal || 1)
                : status === true;
            });

            if (
              completedHabits.length === scheduledHabits.length &&
              scheduledHabits.length > 0
            ) {
              completed++;
            } else {
              break; // Streak broken
            }
          }
          isCompleted = completed >= template.duration;
          break;

        case "single_habit":
          // Check if any habit has required streak
          const habitStreaks = habits.map((habit) => {
            let streak = 0;
            for (
              let i = 0;
              i < Math.min(daysPassed + 1, template.duration);
              i++
            ) {
              const checkDate = new Date(startDate);
              checkDate.setDate(checkDate.getDate() + i);
              const dateStr = formatDate(checkDate);
              const status = habitLog[dateStr]?.[habit.id];

              if (
                habit.isMeasurable
                  ? typeof status === "number" && status >= (habit.goal || 1)
                  : status === true
              ) {
                streak++;
              } else {
                break;
              }
            }
            return streak;
          });
          completed = Math.max(...habitStreaks, 0);
          total = template.duration;
          isCompleted = completed >= template.duration;
          break;

        case "percentage":
          // Calculate overall completion percentage
          let totalPossible = 0;
          let totalCompleted = 0;

          for (
            let i = 0;
            i < Math.min(daysPassed + 1, template.duration);
            i++
          ) {
            const checkDate = new Date(startDate);
            checkDate.setDate(checkDate.getDate() + i);
            const dateStr = formatDate(checkDate);
            const dayLog = habitLog[dateStr] || {};

            const scheduledHabits = habits.filter((h) =>
              isHabitScheduledForDate(h, checkDate)
            );
            totalPossible += scheduledHabits.length;

            scheduledHabits.forEach((h) => {
              const status = dayLog[h.id];
              if (
                h.isMeasurable
                  ? typeof status === "number" && status >= (h.goal || 1)
                  : status === true
              ) {
                totalCompleted++;
              }
            });
          }

          const percentage =
            totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
          completed = Math.round(percentage);
          total = template.targetPercentage;
          isCompleted =
            percentage >= template.targetPercentage &&
            daysPassed >= template.duration - 1;
          break;
      }

      progress[challenge.id] = {
        completed,
        total,
        isCompleted,
        daysRemaining: Math.max(0, template.duration - daysPassed - 1),
        percentage: Math.round((completed / total) * 100),
      };
    });

    return progress;
  }, [activeChallenges, challengeTemplates, habits, habitLog]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
      case "hard":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20";
      case "legendary":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  const startChallenge = (template) => {
    const newChallenge = {
      id: `challenge_${Date.now()}`,
      templateId: template.id,
      startDate: new Date().toISOString(),
      status: "active",
    };

    if (onStartChallenge) {
      onStartChallenge(newChallenge);
    }
  };

  const isActive = (templateId) => {
    return activeChallenges.some(
      (c) => c.templateId === templateId && c.status === "active"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Habit Challenges
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Take on challenges to boost your motivation and earn extra rewards!
        </p>
      </CardHeader>
      <CardContent>
        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Active Challenges
            </h3>
            <div className="space-y-3">
              {activeChallenges.map((challenge) => {
                const template = challengeTemplates.find(
                  (t) => t.id === challenge.templateId
                );
                const progress = challengeProgress[challenge.id];
                if (!template || !progress) return null;

                const Icon = template.icon;
                const difficultyClasses = getDifficultyColor(
                  template.difficulty
                );

                return (
                  <div
                    key={challenge.id}
                    className="p-4 border rounded-lg dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/70 dark:bg-black/20">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {progress.isCompleted && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Complete!</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>
                          Progress: {progress.completed}/{progress.total}
                        </span>
                        <span>{progress.daysRemaining} days left</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.isCompleted
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(progress.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Available Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeTemplates.map((template) => {
              const Icon = template.icon;
              const difficultyClasses = getDifficultyColor(template.difficulty);
              const active = isActive(template.id);

              return (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg dark:border-gray-700 transition-all duration-200 ${
                    active ? "opacity-50" : "hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${difficultyClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {template.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {template.reward} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${difficultyClasses}`}
                      >
                        {template.difficulty}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => startChallenge(template)}
                        disabled={active || habits.length === 0}
                      >
                        {active ? "Active" : "Start"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {habits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Create some habits first to unlock challenges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ChallengesPanel };
