// src/utils/helpers.js

/**
 * Formats a Date object into a YYYY-MM-DD string using LOCAL date parts.
 * @param {Date} date - The date object to format.
 * @returns {string|null} The formatted date string or null if invalid.
 */
export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  // Use local methods
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object representing midnight LOCAL time.
 * @param {string} dateString - The date string to parse.
 * @returns {Date|null} The parsed Date object (local midnight) or null if invalid.
 */
export const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null;
  }
  const [year, month, day] = parts;
  // Create a date object representing midnight in the local timezone
  // Month is 0-indexed (0=Jan, 1=Feb, etc.)
  const date = new Date(year, month - 1, day, 0, 0, 0, 0); // Explicitly set time to 00:00:00.000

  // Additional validation: Check if the created date parts match the input
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn(`Invalid date created from string: ${dateString}`);
    return null;
  }
  return date;
};

/**
 * Returns a greeting based on the current hour.
 * @returns {string} "Good Morning", "Good Afternoon", or "Good Evening".
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};


/**
 * *** NEW FUNCTION ***
 * Checks if a habit is scheduled to be active on a specific date, considering its schedule type.
 * @param {object} habit - The habit object, potentially including scheduleType, scheduleDays, startDate, endDate.
 * @param {Date} date - The specific date to check.
 * @returns {boolean} True if the habit is scheduled for the given date, false otherwise.
 */
export const isHabitScheduledForDate = (habit, date) => {
    if (!habit || !date || !(date instanceof Date) || isNaN(date)) {
        // console.warn('Invalid input to isHabitScheduledForDate');
        return false;
    }

    // Use parseDate(formatDate(date)) to ensure we are comparing midnight local time consistently
    const checkDate = parseDate(formatDate(date));
    if (!checkDate) return false;

    // 1. Check Start and End Dates
    if (!habit.startDate) return false; // Habit requires a start date
    const startDate = parseDate(habit.startDate);
    if (!startDate || startDate > checkDate) {
        return false; // Not started yet
    }
    if (habit.endDate) {
        const endDate = parseDate(habit.endDate);
        if (endDate && endDate < checkDate) {
            return false; // Already ended
        }
    }

    // 2. Check Schedule Type
    const scheduleType = habit.scheduleType || 'daily'; // Default to daily if not specified

    switch (scheduleType) {
        case 'daily':
            return true; // Always active if within date range

        case 'specific_days':
            const dayOfWeek = checkDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
            // Ensure scheduleDays is a valid array of numbers
            if (Array.isArray(habit.scheduleDays) && habit.scheduleDays.every(d => typeof d === 'number')) {
                return habit.scheduleDays.includes(dayOfWeek);
            }
            console.warn(`Habit ${habit.title} has scheduleType 'specific_days' but invalid scheduleDays:`, habit.scheduleDays);
            return false; // Invalid scheduleDays data

        case 'frequency_weekly':
            // For display purposes, consider frequency habits active every day within their range.
            // The user decides when to log them. Stats calculation needs separate logic.
            return true;

        // case 'frequency_monthly': // Future enhancement
        //     return true; // Assume active for display filtering

        default:
            console.warn(`Unknown scheduleType '${scheduleType}' for habit ${habit.title}. Treating as daily.`);
            return true; // Treat unknown types as daily for now
    }
};
