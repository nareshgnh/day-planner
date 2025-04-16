// src/utils/helpers.js

/**
 * Formats a Date object into a YYYY-MM-DD string using LOCAL date parts.
 * @param {Date} date - The date object to format.
 * @returns {string|null} The formatted date string or null if invalid.
 */
export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  // Use local methods
  const year = date.getFullYear(); // Use getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Use getMonth()
  const day = String(date.getDate()).padStart(2, "0"); // Use getDate()
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object representing midnight LOCAL time.
 * @param {string} dateString - The date string to parse.
 * @returns {Date|null} The parsed Date object (local midnight) or null if invalid.
 */
export const parseDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const parts = dateString.split("-").map(Number);
  // Check if parts are valid numbers before creating Date
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null;
  }
  const [year, month, day] = parts;
  // Create a date object representing midnight in the local timezone
  // Note: Month is 0-indexed in Date constructor (0=Jan, 1=Feb, etc.)
  const date = new Date(year, month - 1, day);

  // Additional validation: Check if the created date parts match the input
  // This catches invalid dates like 2023-02-30 which might otherwise roll over
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
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
