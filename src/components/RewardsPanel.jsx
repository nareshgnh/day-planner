// src/components/RewardsPanel.jsx
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Crown,
  Flame,
  Medal,
} from "lucide-react";

const RewardsPanel = ({ habits, habitLog }) => {
  const achievements = useMemo(() => {
    if (!habits || !habitLog || habits.length === 0) return [];

    const today = new Date();
    const achievements = [];

    // Calculate various achievement metrics
    let totalCompletions = 0;
    let longestStreak = 0;
    let perfectDays = 0;
    let totalHabits = habits.length;

    Object.entries(habitLog).forEach(([dateStr, logs]) => {
      const dayHabits = habits.filter(
        (h) =>
          // Simple check if habit was scheduled for that day
          true // TODO: Add proper date filtering
      );

      let dayCompletions = 0;
      dayHabits.forEach((habit) => {
        const status = logs[habit.id];
        if (
          status === true ||
          (habit.isMeasurable &&
            typeof status === "number" &&
            status >= (habit.goal || 1))
        ) {
          totalCompletions++;
          dayCompletions++;
        }
      });

      if (dayHabits.length > 0 && dayCompletions === dayHabits.length) {
        perfectDays++;
      }
    });

    // Achievement definitions
    const achievementsList = [
      {
        id: "first_habit",
        name: "Getting Started",
        description: "Created your first habit",
        icon: Target,
        earned: totalHabits >= 1,
        rarity: "common",
        points: 10,
      },
      {
        id: "habit_collector",
        name: "Habit Collector",
        description: "Created 5 different habits",
        icon: Star,
        earned: totalHabits >= 5,
        rarity: "uncommon",
        points: 50,
      },
      {
        id: "perfectionist",
        name: "Perfectionist",
        description: "Completed all habits in a day",
        icon: Crown,
        earned: perfectDays >= 1,
        rarity: "rare",
        points: 100,
      },
      {
        id: "week_warrior",
        name: "Week Warrior",
        description: "7 perfect days",
        icon: Medal,
        earned: perfectDays >= 7,
        rarity: "epic",
        points: 300,
      },
      {
        id: "centurion",
        name: "Centurion",
        description: "100 habit completions",
        icon: Trophy,
        earned: totalCompletions >= 100,
        rarity: "legendary",
        points: 500,
      },
      {
        id: "streak_master",
        name: "Streak Master",
        description: "30-day streak on any habit",
        icon: Flame,
        earned: longestStreak >= 30,
        rarity: "legendary",
        points: 1000,
      },
    ];

    return achievementsList;
  }, [habits, habitLog]);

  const totalPoints = achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + a.points, 0);

  const earnedCount = achievements.filter((a) => a.earned).length;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
      case "uncommon":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "rare":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20";
      case "epic":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20";
      case "legendary":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements & Rewards
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            {totalPoints} XP
          </span>
          <span>
            {earnedCount}/{achievements.length} Unlocked
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const rarityClasses = getRarityColor(achievement.rarity);

            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  achievement.earned
                    ? `${rarityClasses} border-current shadow-md`
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      achievement.earned
                        ? "bg-white/50 dark:bg-black/20"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        achievement.earned
                          ? ""
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold text-sm leading-tight ${
                        achievement.earned
                          ? ""
                          : "text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      {achievement.name}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-tight ${
                        achievement.earned
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/70 dark:bg-black/30 whitespace-nowrap">
                          +{achievement.points} XP
                        </span>
                        <span className="text-xs capitalize font-medium text-current">
                          {achievement.rarity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export { RewardsPanel };
