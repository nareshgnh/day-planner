// src/pages/StreaksPage.jsx
import React, { useState, useMemo } from "react";
import StreakDashboard from "../components/StreakDashboard";
import StreakMilestoneModal from "../components/StreakMilestoneModal";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { calculateStreakInfo, getStreakMotivation } from "../utils/streakUtils";
import { Flame, Trophy, Target, TrendingUp, Zap } from "lucide-react";

const StreaksPage = ({ habits, habitLog }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedHabitTitle, setSelectedHabitTitle] = useState("");
  const [selectedCurrentStreak, setSelectedCurrentStreak] = useState(0);

  // Calculate all streak data
  const allStreakData = useMemo(() => {
    if (!habits || !habitLog) return [];

    return habits.map((habit) => {
      const streakInfo = calculateStreakInfo(habit, habitLog);
      const motivation = getStreakMotivation(streakInfo, habit.title);

      return {
        habit,
        ...streakInfo,
        motivation,
      };
    });
  }, [habits, habitLog]);

  // Get habits that are close to milestones
  const upcomingMilestones = useMemo(() => {
    const milestones = [7, 14, 30, 50, 100, 365];

    return allStreakData
      .map((data) => {
        const nextMilestone = milestones.find((m) => m > data.currentStreak);
        if (!nextMilestone) return null;

        const daysToMilestone = nextMilestone - data.currentStreak;

        return {
          ...data,
          nextMilestone,
          daysToMilestone,
        };
      })
      .filter(Boolean)
      .filter((data) => data.daysToMilestone <= 7 && data.currentStreak > 0) // Show only if within 7 days
      .sort((a, b) => a.daysToMilestone - b.daysToMilestone);
  }, [allStreakData]);

  // Get habits at risk of losing streaks
  const streaksAtRisk = useMemo(() => {
    return allStreakData
      .filter((data) => data.daysUntilBreak === 1)
      .sort((a, b) => b.currentStreak - a.currentStreak);
  }, [allStreakData]);

  // Get top performers
  const topStreaks = useMemo(() => {
    return allStreakData
      .filter((data) => data.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5);
  }, [allStreakData]);

  const handleCelebrateMilestone = (milestone, habitTitle, currentStreak) => {
    setSelectedMilestone(milestone);
    setSelectedHabitTitle(habitTitle);
    setSelectedCurrentStreak(currentStreak);
  };

  const closeMilestoneModal = () => {
    setSelectedMilestone(null);
    setSelectedHabitTitle("");
    setSelectedCurrentStreak(0);
  };

  if (!habits || habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <Flame className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No Habits Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create some habits to start building amazing streaks!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-orange-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-2">
          <Flame className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Streak Central
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Track your consistency and celebrate your commitment! 🔥
        </p>
      </div>

      {/* Alerts Section */}
      {(streaksAtRisk.length > 0 || upcomingMilestones.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Streaks at Risk */}
          {streaksAtRisk.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                  <Target className="h-5 w-5" />
                  <span>Streaks at Risk!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {streaksAtRisk.map((data) => (
                  <div
                    key={data.habit.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {data.habit.title}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {data.currentStreak} day streak at risk!
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Complete today to save it
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                  <Trophy className="h-5 w-5" />
                  <span>Upcoming Milestones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMilestones.map((data) => (
                  <div
                    key={data.habit.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {data.habit.title}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {data.daysToMilestone} days to {data.nextMilestone}-day
                        milestone
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCelebrateMilestone(
                          data.nextMilestone,
                          data.habit.title,
                          data.nextMilestone
                        )
                      }
                      className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/30"
                    >
                      Preview 🎉
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Performers */}
      {topStreaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topStreaks.map((data, index) => (
                <div
                  key={data.habit.id}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0
                      ? "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
                      : index === 1
                      ? "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50"
                      : index === 2
                      ? "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {index === 0 && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    {index === 1 && (
                      <Trophy className="h-5 w-5 text-gray-500" />
                    )}
                    {index === 2 && (
                      <Trophy className="h-5 w-5 text-orange-500" />
                    )}
                    {index > 2 && <Zap className="h-5 w-5 text-blue-500" />}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {data.habit.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {data.currentStreak} days
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Best: {data.bestStreak} days
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Streak Dashboard */}
      <StreakDashboard habits={habits} habitLog={habitLog} />

      {/* Milestone Modal */}
      <StreakMilestoneModal
        isOpen={!!selectedMilestone}
        onClose={closeMilestoneModal}
        milestone={selectedMilestone}
        habitTitle={selectedHabitTitle}
        currentStreak={selectedCurrentStreak}
      />
    </div>
  );
};

export default StreaksPage;
