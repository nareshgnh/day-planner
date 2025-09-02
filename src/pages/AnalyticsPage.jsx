// src/pages/AnalyticsPage.jsx
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { ChallengesPanel } from "../components/ChallengesPanel";
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  calculateStats,
  aggregateCompletionByWeek,
  aggregateCompletionByMonth,
  findBestWorstWeek,
} from "../utils/stats";
import { formatDate, isHabitScheduledForDate } from "../utils/helpers";
// import { PersonalBestsPanel } from "../components/PersonalBestsPanel";
// import { HabitHeatmap } from "../components/HabitHeatmap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = ({ habits, habitLog }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const handleStartChallenge = (challenge) => {
    setActiveChallenges((prev) => [...prev, challenge]);
    // In a real app, this would save to Firebase/backend
  };
  // Add error handling
  console.log("Analytics page rendering with:", {
    habitsCount: habits?.length,
    habitLogKeys: Object.keys(habitLog || {}).length,
  });

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    console.log("Calculating analytics...", { habits, habitLog });

    if (!habits || !Array.isArray(habits) || habits.length === 0) {
      console.log("No habits found, returning null");
      return null;
    }

    if (!habitLog || typeof habitLog !== "object") {
      console.log("No habit log found, returning null");
      return null;
    }

    try {
      // Overall completion rates over time
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      const dailyCompletionRates = last30Days.map((date) => {
        const dateStr = formatDate(date);
        const dayLog = habitLog[dateStr] || {};
        const scheduledHabits = habits
          .filter((h) =>
            categoryFilter === "All"
              ? true
              : (h.category || "Uncategorized") === categoryFilter
          )
          .filter((h) => isHabitScheduledForDate(h, date));

        if (scheduledHabits.length === 0)
          return { date: dateStr, rate: 0, scheduled: 0 };

        let completed = 0;
        scheduledHabits.forEach((habit) => {
          const status = dayLog[habit.id];
          const isCompleted = habit.isMeasurable
            ? typeof status === "number" && habit.goal && status >= habit.goal
            : status === true;
          if (isCompleted) completed++;
        });

        return {
          date: dateStr,
          rate: (completed / scheduledHabits.length) * 100,
          scheduled: scheduledHabits.length,
          completed,
        };
      });

      // Habit category breakdown
      const categoryData = habits.reduce((acc, habit) => {
        const category = habit.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Best performing habits
      const habitPerformance = habits
        .filter((h) =>
          categoryFilter === "All"
            ? true
            : (h.category || "Uncategorized") === categoryFilter
        )
        .map((habit) => {
          const stats = calculateStats(habit, habitLog);
          const completionRate =
            stats.totalOpportunities > 0
              ? (stats.totalCompleted / stats.totalOpportunities) * 100
              : 0;
          return {
            ...habit,
            ...stats,
            completionRate,
          };
        })
        .sort((a, b) => b.completionRate - a.completionRate);

      // Weekly and Monthly aggregates + best/worst weeks (12w/6m)
      const weeklyAgg = aggregateCompletionByWeek(
        habits,
        habitLog,
        12,
        categoryFilter === "All" ? null : categoryFilter
      );
      const monthlyAgg = aggregateCompletionByMonth(
        habits,
        habitLog,
        6,
        categoryFilter === "All" ? null : categoryFilter
      );
      const bestWorst = findBestWorstWeek(weeklyAgg);

      return {
        dailyCompletionRates,
        categoryData,
        habitPerformance,
        totalHabits: habits.length,
        activeStreaks: habitPerformance.filter((h) => h.currentStreak > 0)
          .length,
        weeklyAgg,
        monthlyAgg,
        bestWorst,
      };
    } catch (error) {
      console.error("Error calculating analytics:", error);
      return null;
    }
  }, [habits, habitLog, categoryFilter]);

  if (!analytics) {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <LineChart
            size={28}
            className="mr-3 text-green-600 dark:text-green-400"
          />
          Analytics Dashboard
        </h2>
        <Card>
          <CardContent className="pt-6 text-center text-gray-500 dark:text-gray-400">
            {!habits || habits.length === 0
              ? "Add some habits to see your analytics!"
              : "Loading analytics data..."}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chart configurations
  const completionTrendData = {
    labels: analytics.dailyCompletionRates.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Daily Completion Rate (%)",
        data: analytics.dailyCompletionRates.map((d) => d.rate),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(analytics.categoryData),
    datasets: [
      {
        data: Object.values(analytics.categoryData),
        backgroundColor: [
          "#6366F1",
          "#8B5CF6",
          "#EC4899",
          "#EF4444",
          "#F59E0B",
          "#10B981",
          "#06B6D4",
          "#84CC16",
          "#F97316",
          "#64748B",
        ],
      },
    ],
  };

  const topHabitsData = {
    labels: analytics.habitPerformance
      .slice(0, 5)
      .map((h) =>
        h.title.length > 15 ? h.title.substring(0, 15) + "..." : h.title
      ),
    datasets: [
      {
        label: "Completion Rate (%)",
        data: analytics.habitPerformance
          .slice(0, 5)
          .map((h) => h.completionRate),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const weeklyChartData = {
    labels: analytics.weeklyAgg.map((w) => w.weekStart),
    datasets: [
      {
        label: "Weekly Completion %",
        data: analytics.weeklyAgg.map((w) => Math.round(w.rate)),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: analytics.monthlyAgg.map((m) => m.month),
    datasets: [
      {
        label: "Monthly Completion %",
        data: analytics.monthlyAgg.map((m) => Math.round(m.rate)),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(67, 56, 202, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <LineChart size={28} className="mr-3 text-green-600 dark:text-green-400" />
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="analytics-category" className="text-sm text-gray-600 dark:text-gray-400">
            Category
          </label>
          <select
            id="analytics-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-50"
            aria-label="Filter analytics by category"
          >
            <option>All</option>
            {[...new Set((habits || []).map((h) => h.category || "Uncategorized"))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Personal Bests Panel - New motivational section */}
      {/* <PersonalBestsPanel habits={habits} habitLog={habitLog} /> */}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Habits
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalHabits}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Streaks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.activeStreaks}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Completion
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    analytics.dailyCompletionRates.reduce(
                      (sum, d) => sum + d.rate,
                      0
                    ) / analytics.dailyCompletionRates.length
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Best Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.max(
                    ...analytics.habitPerformance.map((h) => h.currentStreak),
                    0
                  )}
                  d
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} /> Weekly Completion (last 12 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={weeklyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} /> Monthly Completion (last 6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
        {/* Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              30-Day Completion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={completionTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function (value) {
                          return value + "%";
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Habits by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Habits */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              Top 5 Performing Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={topHabitsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function (value) {
                          return value + "%";
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Week Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Best Week</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bestWorst?.best ? (
              <div className="text-sm">
                <div className="font-medium">Week of {analytics.bestWorst.best.weekStart}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {Math.round(analytics.bestWorst.best.rate)}% completion ({analytics.bestWorst.best.completed}/{analytics.bestWorst.best.scheduled})
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Insufficient data</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worst Week</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bestWorst?.worst ? (
              <div className="text-sm">
                <div className="font-medium">Week of {analytics.bestWorst.worst.weekStart}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {Math.round(analytics.bestWorst.worst.rate)}% completion ({analytics.bestWorst.worst.completed}/{analytics.bestWorst.worst.scheduled})
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Insufficient data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Habit Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Habit Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-2">Habit</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Current Streak</th>
                  <th className="text-left p-2">Completion Rate</th>
                  <th className="text-left p-2">Total Completed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.habitPerformance.map((habit) => (
                  <tr key={habit.id} className="border-b dark:border-gray-800">
                    <td className="p-2 font-medium">{habit.title}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          habit.type === "bad"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {habit.type === "bad" ? "Break Bad" : "Build Good"}
                      </span>
                    </td>
                    <td className="p-2">{habit.currentStreak} days</td>
                    <td className="p-2">{Math.round(habit.completionRate)}%</td>
                    <td className="p-2">
                      {habit.totalCompleted}/{habit.totalOpportunities}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Habit Heatmaps */}
      {/* Temporarily commented out for debugging
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Calendar
            size={24}
            className="mr-2 text-purple-600 dark:text-purple-400"
          />
          Habit Progress Heatmaps
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {analytics.habitPerformance.slice(0, 6).map((habit) => (
            <HabitHeatmap key={habit.id} habit={habit} habitLog={habitLog} />
          ))}
        </div>
      </div>
      */}

      {/* Challenges Section */}
      <div className="space-y-6">
        <ChallengesPanel
          habits={habits}
          habitLog={habitLog}
          activeChallenges={activeChallenges}
          onStartChallenge={handleStartChallenge}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
