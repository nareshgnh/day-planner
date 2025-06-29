// src/components/CalendarCard.jsx
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDate } from "../utils/helpers";

export const CalendarCard = ({
  selectedDate,
  onDateSelect,
  getTileClassName,
}) => {
  // Handle date change
  const handleDateChange = (newDate) => {
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  // Simple tile class name function
  const tileClassNameWrapper = ({ date, view }) => {
    if (view !== "month") return null;

    const classes = [];

    // Add custom classes for habit status
    if (getTileClassName) {
      const habitClass = getTileClassName({ date, view });
      if (habitClass) {
        classes.push(habitClass);
      }
    }

    return classes.join(" ") || null;
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        className="habit-calendar"
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassNameWrapper}
        maxDate={new Date()}
        minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        showNeighboringMonth={false}
      />
    </div>
  );
};
