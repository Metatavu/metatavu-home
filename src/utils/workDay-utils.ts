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
 * Formats a date into a local date string (YYYY-MM-DD).
 *
 * @param date - The date to format.
 * @returns A string in the format `YYYY-MM-DD`.
 *
 * @example
 * formatDate(new Date("2025-10-06")); // → "2025-10-06"
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns the abbreviated month label for a given date (e.g., "Jan", "Feb").
 *
 * @param date - The date to get the month from.
 * @returns A short month name based on the system locale.
 *
 * @example
 * getMonthLabel(new Date("2025-10-06")); // → "Oct"
 */
export const getMonthLabel = (date: Date, locale: string): string =>
  date.toLocaleString(locale, { month: "short" });

/**
 * Returns a label representing the week of a given date.
 *
 * @param date - The reference date.
 * @returns A string in the format `Week YYYY-MM-DD`, where the date is the week start.
 *
 * @example
 * getWeekLabel(new Date("2025-10-06")); // → "Week 2025-10-06"
 */
export const getWeekLabel = (date: Date): string =>
  `${strings.timeExpressions.week} ${formatDate(date)}`;

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
export const getDayLabel = (date: Date, locale: string = "en-US"): string =>
  date.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

/**
 * Returns the date range for the current year up to today for the fetch to severa.
 *
 * @returns An object containing `startDate` (January 1st of the current year)
 *          and `endDate` (today's date) as Date objects.
 */
export const getCurrentYearRange = () => {
  const year = new Date().getFullYear();

  const startDate = new Date(year, 0, 1);

  const endDate = new Date();

  return { startDate, endDate };
};

/**
 * Normalizes a date to a string in `YYYY-MM-DD` format after the API fetch.
 *
 * @param date - The date to normalize, either as a `Date` object or a string.
 * @returns A string representing the date in `YYYY-MM-DD` format.
 *
 */
export const normalizeDate = (date: Date | string) => {
  return typeof date === "string" ? date : formatDate(date);
};
