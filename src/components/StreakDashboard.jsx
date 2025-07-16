// src/components/StreakDashboard.jsx
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import StreakBadge from "./StreakBadge";
import { calculateStreakInfo, getStreakLevel } from "../utils/streakUtils";
import { Flame, Trophy, TrendingUp, Target } from "lucide-react";

const StreakDashboard = ({ habits, habitLog }) => {
  const streakData = useMemo(() => {
    if (!habits || !habitLog) return [];

    return habits
      .map((habit) => {
        const streakInfo = calculateStreakInfo(habit, habitLog);
        const level = getStreakLevel(streakInfo.currentStreak);

        return {
          habit,
          ...streakInfo,
          level,
        };
      })
      .sort((a, b) => b.currentStreak - a.currentStreak); // Sort by current streak desc
  }, [habits, habitLog]);

  const stats = useMemo(() => {
    const totalStreaks = streakData.filter((s) => s.currentStreak > 0).length;
    const longestStreak = Math.max(
      ...streakData.map((s) => s.currentStreak),
      0
    );
    const bestOverallStreak = Math.max(
      ...streakData.map((s) => s.bestStreak),
      0
    );
    const averageStreak =
      totalStreaks > 0
        ? Math.round(
            streakData.reduce((sum, s) => sum + s.currentStreak, 0) /
              totalStreaks
          )
        : 0;

    return {
      totalStreaks,
      longestStreak,
      bestOverallStreak,
      averageStreak,
    };
  }, [streakData]);

  if (!habits || habits.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Add some habits to start building streaks!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-orange-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalStreaks}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active Streaks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.longestStreak}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Longest Current
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.bestOverallStreak}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Best Ever
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.averageStreak}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Habit Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Habit Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {streakData.map(
              ({
                habit,
                currentStreak,
                bestStreak,
                isOnStreak,
                daysUntilBreak,
                level,
              }) => (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    daysUntilBreak === 1
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : isOnStreak
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {habit.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${level.textColor} bg-current bg-opacity-10`}
                      >
                        {level.title}
                      </span>
                    </div>

                    {daysUntilBreak === 1 && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        ⚠️ Complete today to keep your streak alive!
                      </p>
                    )}

                    {currentStreak > 0 && !daysUntilBreak && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isOnStreak ? "🔥 On fire!" : "💪 Building momentum"}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <StreakBadge
                      currentStreak={currentStreak}
                      bestStreak={bestStreak}
                      habitTitle={habit.title}
                      size="default"
                      showMilestone={true}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDashboard;
