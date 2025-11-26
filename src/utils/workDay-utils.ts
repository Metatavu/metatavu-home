import { DateTime } from "luxon";
import type { ChartDataPoint } from "src/components/work-hours/workDays-chart";
import type { ListWorkdaysForUser } from "src/generated/homeLambdasClient";
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

/**
 * Aggregates workdays by week for charting.
 */
export const getWeekData = (
  entries: ListWorkdaysForUser[],
  weekOffset: number,
  locale: string
): ChartDataPoint[] => {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const targetWeekStart = new Date(currentWeekStart);
  targetWeekStart.setDate(currentWeekStart.getDate() + weekOffset * 7);
  const targetWeekEnd = getWeekEnd(targetWeekStart);

  const entryMap = new Map(entries.map((e) => [normalizeDate(e.date), e]));
  const weekDays: Date[] = [];

  for (let d = new Date(targetWeekStart); d <= targetWeekEnd; d.setDate(d.getDate() + 1)) {
    if (d.getDay() >= 1 && d.getDay() <= 5) weekDays.push(new Date(d));
  }

  return weekDays.map((d) => {
    const entry = entryMap.get(normalizeDate(d));
    return {
      period: getDayLabel(d, locale),
      hours: entry?.enteredHours || 0,
      expected: entry?.expectedHours || 0,
      isHoliday: entry?.isHoliday || false,
      holidayName: entry?.holidayName ?? null,
      week: getNumberWeekLabel(targetWeekStart),
      targetWeek: targetWeekStart
    };
  });
};

/**
 * Aggregates workdays by month for charting.
 */
export const getMonthData = (
  entries: ListWorkdaysForUser[],
  targetMonth: number,
  targetYear: number,
  locale: string
): ChartDataPoint[] => {
  const start = new Date(targetYear, targetMonth, 1);
  const end = new Date(targetYear, targetMonth + 1, 0);

  const grouped: Record<string, { hours: number; expected: number; entryDates: Date[] }> = {};

  entries.forEach((e) => {
    const d = new Date(e.date);
    if (d >= start && d <= end) {
      const weekStart = getWeekStart(d);
      const key = weekStart.toISOString();
      if (!grouped[key]) grouped[key] = { hours: 0, expected: 0, entryDates: [] };
      grouped[key].hours += e.enteredHours;
      grouped[key].expected += e.expectedHours;
      grouped[key].entryDates.push(d);
    }
  });

  return Object.entries(grouped)
    .map(([weekKey, values]) => {
      const weekStart = new Date(weekKey);
      const monthsCount: Record<number, number> = {};
      values.entryDates.forEach((d) => {
        monthsCount[d.getMonth()] = (monthsCount[d.getMonth()] || 0) + 1;
      });
      const majorityMonth = Number(Object.entries(monthsCount).sort((a, b) => b[1] - a[1])[0][0]);
      return {
        period: getNumberWeekLabel(weekStart),
        hours: values.hours,
        expected: values.expected,
        month: new Date(targetYear, majorityMonth).toLocaleString(locale, { month: "long" })
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
};

/**
 * Aggregates workdays by year for charting.
 */
export const getYearData = (entries: ListWorkdaysForUser[], locale: string): ChartDataPoint[] => {
  const year = new Date().getFullYear();
  const grouped: Record<number, { hours: number; expected: number }> = {};

  entries.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year) {
      const month = d.getMonth();
      if (!grouped[month]) grouped[month] = { hours: 0, expected: 0 };
      grouped[month].hours += e.enteredHours;
      grouped[month].expected += e.expectedHours;
    }
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([month, values]) => ({
      period: getMonthLabel(new Date(year, Number(month)), locale),
      hours: values.hours,
      expected: values.expected
    }));
};
