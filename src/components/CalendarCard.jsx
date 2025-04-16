// src/components/CalendarCard.jsx
import React from "react";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"; // Adjust path

export const CalendarCard = ({
  selectedDate,
  setSelectedDate,
  getTileClassName,
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon
            size={20}
            className="text-purple-600 dark:text-purple-400"
          />
          Habit Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pb-4">
        {" "}
        {/* Added pb-4 */}
        {/* Wrapper to control calendar size */}
        <div className="react-calendar-wrapper max-w-full sm:max-w-xs mx-auto">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={getTileClassName}
            maxDate={new Date()} // Prevent selecting future dates
            minDate={new Date(new Date().getFullYear() - 5, 0, 1)} // Limit past view
            className="text-sm" // Base styles handled by CSS in App.jsx <style>
          />
        </div>
      </CardContent>
    </Card>
  );
};
