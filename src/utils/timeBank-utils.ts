import { DateTime } from "luxon";
import strings from "src/localization/strings";

/**
 * Returns the Monday (start of the week) for a given date.
 *
 * @param date - The reference date.
 * @returns A new `Date` object representing the Monday of the same week.
 *
 * @example
 * getWeekStart(new Date("2025-10-08")); // → 2025-10-06 (Monday)
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7)); // Monday
  return monday;
};

/**
 * Returns the Sunday (end of the week) for a given date.
 *
 * @param date - The reference date.
 * @returns A new `Date` object representing the Sunday of the same week.
 *
 * @example
 * getWeekEnd(new Date("2025-10-08")); // → 2025-10-12 (Sunday)
 */
export const getWeekEnd = (date: Date): Date => {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

/**
 * Formats a date into an ISO-like string (YYYY-MM-DD).
 *
 * @param date - The date to format.
 * @returns A string in the format `YYYY-MM-DD`.
 *
 * @example
 * formatDate(new Date("2025-10-06")); // → "2025-10-06"
 */
export const formatDate = (date: Date): string => date.toISOString().substring(0, 10);

/**
 * Returns the abbreviated month label for a given date (e.g., "Jan", "Feb").
 *
 * @param date - The date to get the month from.
 * @returns A short month name based on the system locale.
 *
 * @example
 * getMonthLabel(new Date("2025-10-06")); // → "Oct"
 */
export const getMonthLabel = (date: Date): string =>
  date.toLocaleString("default", { month: "short" });

/**
 * Returns a label representing the week of a given date.
 *
 * @param date - The reference date.
 * @returns A string in the format `Week YYYY-MM-DD`, where the date is the week start.
 *
 * @example
 * getWeekLabel(new Date("2025-10-06")); // → "Week 2025-10-06"
 */
export const getWeekLabel = (date: Date): string => `${strings.timeExpressions.week} ${formatDate(date)}`;

/**
 * Returns a label representing the ISO week number of a given date.
 *
 * @param date - The reference date.
 * @returns A string in the format `Week <number> (<year>)`.
 *
 * @example
 * getNumberWeekLabel(new Date("2025-10-06")); // → "Week 41 (2025)"
 */
export const getNumberWeekLabel = (date: Date): string => {
  const dt = DateTime.fromJSDate(date);
  const weekNumber = dt.weekNumber;
  const weekYear = dt.weekYear;
  return `${strings.timeExpressions.week} ${weekNumber} (${weekYear})`;
};

/**
 * Returns a human-readable day label (e.g., "Mon, Oct 6").
 *
 * @param date - The date to format.
 * @returns A formatted string including weekday, month, and day.
 *
 * @example
 * getDayLabel(new Date("2025-10-06")); // → "Mon, Oct 6"
 */
export const getDayLabel = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
