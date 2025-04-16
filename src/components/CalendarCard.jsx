// src/components/CalendarCard.jsx
import React from "react";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"; // Adjust path

// Modified to accept onDateSelect callback
export const CalendarCard = ({
  selectedDate,
  onDateSelect,
  getTileClassName,
}) => {
  // Handle date change: call the passed callback
  const handleDateChange = (newDate) => {
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  return (
    <>
      <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
        <Calendar
          onChange={handleDateChange} // Use the new handler
          value={selectedDate}
          tileClassName={getTileClassName}
          maxDate={new Date()} // Prevent selecting future dates
          minDate={new Date(new Date().getFullYear() - 5, 0, 1)} // Limit past view
          className="text-sm" // Base styles handled by CSS in App.jsx <style>
        />
      </div>
      {/* </CardContent> */}
    </>
    // </Card>
  );
};
