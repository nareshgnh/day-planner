import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { parseDate, isHabitScheduledForDate } from '../utils/helpers'; // Assuming these are available and work as expected

const HabitVisuals = ({ habits, habitLog }) => {
  if (!habits || habits.length === 0) {
    return (
      <div>
        <h2>Habit Visualizations</h2>
        <p>No habits configured to display visualizations.</p>
      </div>
    );
  }

  const today = new Date();
  const endDate = new Date(today); // End date is today
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 180); // Start date is 180 days ago

  // Helper to format date to YYYY-MM-DD string, robustly
  const formatDateKey = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      if (isNaN(year) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return null;
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", date, e);
      return null;
    }
  };

  const getHabitDataForHeatmap = (habit, log) => {
    const values = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = formatDateKey(new Date(d)); // Ensure a fresh Date object for formatting
      if (!dateString) continue;

      const dateObj = parseDate(dateString); // For isHabitScheduledForDate
      if (!dateObj || !isHabitScheduledForDate(habit, dateObj)) {
        values.push({ date: dateString, count: -1 }); // -1 for not scheduled
        continue;
      }

      const logEntry = log?.[dateString]?.[habit.id];
      let count = 0; // Default to 0 (missed or not logged)

      if (logEntry !== undefined) {
        if (habit.isMeasurable) {
          if (typeof logEntry === 'number' && habit.goal != null && logEntry >= habit.goal) {
            count = 2; // Completed (met goal)
          } else if (typeof logEntry === 'number') {
            count = 1; // Logged but goal not met
          }
        } else { // Non-measurable
          if (logEntry === true) {
            count = 2; // Completed
          } else if (logEntry === false) {
            count = 1; // Logged as missed
          }
        }
      }
      values.push({ date: dateString, count: count });
    }
    return values;
  };

  return (
    <div className="habit-visuals-container" style={{ marginTop: '20px' }}>
      <h2>Habit Heatmaps (Last 180 Days)</h2>
      {habits.map((habit) => {
        const heatmapData = getHabitDataForHeatmap(habit, habitLog);
        return (
          <div key={habit.id} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{habit.name}</h4>
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={heatmapData}
              classForValue={(value) => {
                if (!value || value.count === -1) { // Not scheduled
                  return 'color-empty'; // Or a specific "not-scheduled" class
                }
                if (value.count === 0) { // Not logged or explicitly missed (for non-measurable if not logged)
                  return 'color-missed-or-not-logged';
                }
                if (value.count === 1) { // Logged but goal not met (measurable) or explicitly missed (non-measurable)
                  return 'color-logged-not-goal';
                }
                if (value.count === 2) { // Completed / Goal met
                  return 'color-completed';
                }
                return 'color-empty';
              }}
              titleForValue={(value) => {
                if (!value || !value.date) return 'No data';
                let status = 'Not scheduled';
                if (value.count === 0) status = 'Not logged / Missed';
                else if (value.count === 1) status = habit.isMeasurable ? 'Logged (goal not met)' : 'Missed';
                else if (value.count === 2) status = 'Completed';
                return `${value.date}: ${status}`;
              }}
              showWeekdayLabels={true}
              weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            />
            <style>{`
              .react-calendar-heatmap .color-empty {
                fill: #ebedf0;
              }
              .react-calendar-heatmap .color-missed-or-not-logged {
                fill: #fadadd; /* Light pink/red for missed or not logged */
              }
              .react-calendar-heatmap .color-logged-not-goal {
                fill: #ffecb3; /* Light yellow for logged but goal not met */
              }
              .react-calendar-heatmap .color-completed {
                fill: #7bc96f; /* Green for completed */
              }
              /* Tooltip styling */
              .react-calendar-heatmap-tooltip {
                pointer-events: none;
                position: absolute;
                z-index: 9999;
                padding: 5px 10px;
                font-size: 12px;
                color: #fff;
                background-color: rgba(0,0,0,0.8);
                border-radius: 4px;
              }
            `}</style>
          </div>
        );
      })}
      {!habitLog && <p>Loading log data or no log data available...</p>}
    </div>
  );
};

export default HabitVisuals;
