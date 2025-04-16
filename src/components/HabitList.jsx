// src/components/HabitList.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { formatDate, parseDate, isHabitScheduledForDate } from "../utils/helpers";
import { HabitListItem } from "./HabitListItem";
import { CalendarCard } from "./CalendarCard";
import { CalendarDays, Plus, ChevronDown, ChevronUp } from "lucide-react";

// Header component remains the same
const DatePickerHeader = ({ selectedDate, setSelectedDate, onAddHabit, isCalendarOpen, onToggleCalendar }) => {
  const today = new Date(); const isTodaySelected = formatDate(selectedDate) === formatDate(today);
  const handleDateReset = (e) => { e.stopPropagation(); setSelectedDate(new Date()); onToggleCalendar(false); };
  return (
    <div className="relative flex items-center justify-between mb-4 px-4 pt-4 sm:px-6 sm:pt-6 border-b dark:border-gray-700 pb-4">
      <Button ref={useRef()} variant="ghost" className="flex items-center gap-2 p-1 h-auto text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md" onClick={onToggleCalendar} aria-label="Select date" aria-expanded={isCalendarOpen}>
        <CalendarDays className="h-5 w-5 text-gray-600 dark:text-gray-400 shrink-0"/>
        <span>{isTodaySelected ? "Today" : formatDate(selectedDate)}</span>
        {isCalendarOpen ? <ChevronUp className="h-4 w-4 text-gray-500"/> : <ChevronDown className="h-4 w-4 text-gray-500"/>}
      </Button>
      {!isTodaySelected && <Button variant="outline" size="sm" onClick={handleDateReset} className="ml-2 h-8 px-2">Go to Today</Button>}
      <div className="flex-grow"></div>
      <Button onClick={onAddHabit} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md h-9 px-3 ml-2" size="sm"><Plus size={16} className="mr-1"/> Add Habit</Button>
    </div>
  );
};

export const HabitList = ({
  habits,
  habitLog,
  selectedDate,
  setSelectedDate,
  // *** CORRECTED PROP NAME: Expect `updateHabitLog` from App.jsx ***
  updateHabitLog,
  openModalForEditHabit,
  handleDeleteHabitCallback,
  openModalForNewHabit,
  getTileClassName,
  selectedHabitIdForStats,
  onSelectHabitForStats,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const dateButtonRef = useRef(null);
  // *** REMOVED expandedCategories state ***

  const selectedDateStr = useMemo(() => formatDate(selectedDate), [selectedDate]);

  // Filter habits active/scheduled for the selected date
  const activeHabitsForSelectedDate = useMemo(() => {
    if (!selectedDate || !Array.isArray(habits)) return [];
    return habits.filter((habit) => isHabitScheduledForDate(habit, selectedDate));
  }, [habits, selectedDate]);

  // *** REMOVED groupedHabits useMemo ***

  const selectedDayLog = useMemo(() => habitLog[selectedDateStr] || {}, [habitLog, selectedDateStr]);

  const toggleCalendar = useCallback(() => setIsCalendarOpen(prev => !prev), []);
  // *** REMOVED toggleCategory useCallback ***

  const handleInlineDateSelect = useCallback((newDate) => {
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  }, [setSelectedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => { if (isCalendarOpen && calendarRef.current && !calendarRef.current.contains(event.target) && dateButtonRef.current && !dateButtonRef.current.contains(event.target)) { setIsCalendarOpen(false); } };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 flex flex-col flex-grow relative">
      <div ref={dateButtonRef}>
        <DatePickerHeader selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAddHabit={openModalForNewHabit} isCalendarOpen={isCalendarOpen} onToggleCalendar={toggleCalendar}/>
      </div>

      {isCalendarOpen && (
        <div ref={calendarRef} className="absolute top-16 left-4 sm:left-6 z-20 mt-1 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none" role="dialog" aria-modal="true">
          <div className="p-2"><CalendarCard selectedDate={selectedDate} onDateSelect={handleInlineDateSelect} getTileClassName={getTileClassName}/></div>
        </div>
      )}

      {/* *** REVERTED Rendering Logic: Directly map active habits *** */}
      <CardContent className={`flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent px-4 pb-4 sm:px-6 sm:pb-6 pt-0`}>
        {activeHabitsForSelectedDate.length > 0 ? (
          // Render directly as a list without grouping headers
          <ul className="space-y-3">
            {activeHabitsForSelectedDate.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                logStatus={selectedDayLog[habit.id]}
                selectedDate={selectedDate}
                isSelected={habit.id === selectedHabitIdForStats}
                // *** CORRECTED PROP PASSED DOWN ***
                updateHabitLog={updateHabitLog} // Pass the function received from App.jsx
                onEdit={openModalForEditHabit}
                onDelete={handleDeleteHabitCallback}
                onSelect={onSelectHabitForStats}
              />
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
            No habits scheduled for {selectedDateStr}.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
