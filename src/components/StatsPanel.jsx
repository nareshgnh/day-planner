// src/components/StatsPanel.jsx
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import { TrendingUp, TrendingDown, CalendarClock, X } from "lucide-react";
import { formatDate, parseDate } from "../utils/helpers"; // Adjust path
import {
  calculateStats,
  prepareHeatmapData,
  prepareChartData,
} from "../utils/stats"; // *** IMPORT STATS HELPERS ***

// *** IMPORT CHARTING & HEATMAP LIBS ***
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css"; // Import default styles
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, // Added for potential line chart
  PointElement, // Added for potential line chart
  Title as ChartTitlePlugin,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2"; // Use Bar and Line

// *** REGISTER CHART.JS COMPONENTS ***
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, // Added
  PointElement, // Added
  ChartTitlePlugin,
  ChartTooltip,
  ChartLegend
);

export const StatsPanel = ({ habit, habitLog, onClose }) => {
  // Calculate basic stats using the imported utility
  const stats = useMemo(
    () => calculateStats(habit, habitLog),
    [habit, habitLog]
  );

  // *** Prepare data for Heatmap ***
  const heatmapData = useMemo(() => {
    if (!habit || !habitLog) return [];
    return prepareHeatmapData(habit, habitLog);
  }, [habit, habitLog]);

  // Define end date for heatmap (today)
  const heatmapEndDate = new Date();
  // Define start date for heatmap (e.g., 6 months ago)
  const heatmapStartDate = new Date();
  heatmapStartDate.setMonth(heatmapStartDate.getMonth() - 6);

  // *** Prepare data for Charts (Example: Monthly Completion Bar Chart) ***
  const monthlyChartData = useMemo(() => {
    if (!habit || !habitLog) return { labels: [], datasets: [] };
    // You might want to pass a time range or config here
    return prepareChartData(habit, habitLog, "monthlyBar");
  }, [habit, habitLog]);

  // Example options for the chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    plugins: {
      legend: {
        position: "top",
        labels: { color: habit?.type === "bad" ? "#f87171" : "#34d399" }, // Example dynamic color
      },
      title: {
        display: true,
        text: `Monthly Habit Performance (${
          habit?.type === "bad" ? "Avoided" : "Completed"
        })`,
        color: document.documentElement.classList.contains("dark")
          ? "#e5e7eb"
          : "#1f2937", // Adjust for dark mode
      },
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Days",
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
        },
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
        },
      },
    },
  };

  // Handle cases where habit data might be missing briefly
  if (!habit) {
    return (
      <Card className="bg-white/90 dark:bg-gray-950/90 sticky top-4">
        <CardContent className="pt-6 text-center text-gray-500">
          Click on a habit title to see its stats.
        </CardContent>
      </Card>
    );
  }

  const isGoodHabit = habit.type !== "bad";
  const completedLabel = isGoodHabit ? "Completed" : "Avoided";
  const failedLabel = isGoodHabit ? "Missed" : "Indulged";

  // Define class mapping for heatmap colors
  const getClassForValue = (value) => {
    if (!value) {
      return "color-empty";
    }
    // Use levels defined in prepareHeatmapData (e.g., 1=fail, 2=success)
    switch (value.count) {
      case 1:
        return "color-level-1"; // Failed/Indulged
      case 2:
        return "color-level-2"; // Completed/Avoided
      default:
        return "color-empty"; // No data or inactive
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 sticky top-4 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <CardHeader className="sticky top-0 bg-white/90 dark:bg-gray-950/90 z-10 flex flex-row items-center justify-between space-y-0 pb-2 border-b dark:border-gray-800">
        <CardTitle
          className="text-base md:text-lg font-semibold truncate"
          title={habit.title}
        >
          {habit.title} Stats
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={18} />
          <span className="sr-only">Close stats</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Basic Stats Row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Streak
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {stats.currentStreak}d
            </div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <div className="text-xs text-green-700 dark:text-green-300 font-medium">
              {completedLabel}
            </div>
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {stats.totalCompleted}
            </div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <div className="text-xs text-red-700 dark:text-red-300 font-medium">
              {failedLabel}
            </div>
            <div className="text-lg font-bold text-red-900 dark:text-red-100">
              {stats.totalFailed}
            </div>
          </div>
        </div>

        {/* Calendar Heatmap Section */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Activity Heatmap (Last 6 Months)
          </h4>
          <div className="react-calendar-heatmap-container p-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            <CalendarHeatmap
              startDate={heatmapStartDate}
              endDate={heatmapEndDate}
              values={heatmapData}
              classForValue={getClassForValue}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null;
                let statusText = "No Data";
                if (value.count === 1) statusText = failedLabel;
                if (value.count === 2) statusText = completedLabel;
                return {
                  "data-tip": `${value.date}: ${statusText}`,
                };
              }}
              showWeekdayLabels={true}
              weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
              monthLabels={[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ]}
            />
          </div>
        </div>

        {/* Chart Section */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Monthly Performance
          </h4>
          <div className="h-64 p-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {monthlyChartData.labels && monthlyChartData.labels.length > 0 ? (
              <Bar options={chartOptions} data={monthlyChartData} />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm pt-10">
                Not enough data for monthly chart.
              </p>
            )}
          </div>
        </div>

        {/* Placeholder for more charts/stats if needed */}
        {/* <div className="text-center text-gray-400 text-xs pt-4">
          More charts coming soon...
        </div> */}
      </CardContent>
      {/* Add custom styles for heatmap colors here or in index.css */}
      <style>{`
        .react-calendar-heatmap-container {
            font-size: 10px; /* Adjust base size if needed */
        }
        .react-calendar-heatmap text {
            font-size: 0.7em;
            fill: #6b7280; /* Weekday label color */
        }
        .dark .react-calendar-heatmap text {
             fill: #9ca3af;
        }
        .react-calendar-heatmap rect:hover {
             stroke: #3b82f6; /* Highlight on hover */
             stroke-width: 2px;
        }
        .react-calendar-heatmap .color-empty {
             fill: #ebedf0; /* Light mode empty */
        }
        .react-calendar-heatmap .color-level-1 {
             fill: #fecaca; /* Light mode failed/red */
        }
        .react-calendar-heatmap .color-level-2 {
             fill: #a7f3d0; /* Light mode success/green */
        }
        .dark .react-calendar-heatmap .color-empty {
             fill: #374151; /* Dark mode empty */
        }
        .dark .react-calendar-heatmap .color-level-1 {
             fill: #7f1d1d; /* Dark mode failed/red */
        }
        .dark .react-calendar-heatmap .color-level-2 {
             fill: #064e3b; /* Dark mode success/green */
        }
        /* Tooltip styles (if using default data-tip) */
        .__react_component_tooltip {
            background-color: #374151 !important; /* Dark background */
            color: #e5e7eb !important; /* Light text */
            border-radius: 4px !important;
            padding: 4px 8px !important;
            font-size: 12px !important;
            opacity: 0.9 !important;
            z-index: 999 !important;
            pointer-events: none !important;
        }
        .dark .__react_component_tooltip {
             background-color: #f3f4f6 !important; /* Light background */
             color: #1f2937 !important; /* Dark text */
        }
      `}</style>
      {/* Render react-tooltip component if using data-tip attribute */}
      {/* <ReactTooltip place="top" type="dark" effect="solid" /> */}
      {/* You might need to install react-tooltip: npm install react-tooltip */}
    </Card>
  );
};
