import { DateTime } from "luxon";
import { PersonTotalTime } from "../generated/client";
import { DateRangeWithTimePeriod } from "../types";
import { getWeekFromISO } from "./time-utils";

/**
 * Get start dateRange time entries
 *
 * @returns start dateRange time entries
 */
export const getStartRangeTimeEntries = (
  totalTime: PersonTotalTime[],
  endWeek: DateTime,
  dateRange: DateRangeWithTimePeriod
) =>
  totalTime.filter(
    (entry) =>
      entry.timePeriod?.split(",")[0] === String(dateRange.date.start.year) &&
      entry.timePeriod?.split(",")[2] !== "0" &&
      getWeekFromISO(
        entry.timePeriod?.split(",")[0],
        entry.timePeriod?.split(",")[2],
        dateRange.date.start.weekday
      ) < endWeek
  );

/**
 * Get end dateRange time entries
 *
 * @returns end dateRange time entries
 */
export const getEndRangeTimeEntries = (
  totalTime: PersonTotalTime[],
  startWeek: DateTime,
  dateRange: DateRangeWithTimePeriod
) =>
  totalTime.filter(
    (entry) =>
      entry.timePeriod?.split(",")[0] === String(dateRange.date.end.year) &&
      entry.timePeriod?.split(",")[2] !== "0" &&
      getWeekFromISO(
        entry.timePeriod?.split(",")[0],
        entry.timePeriod?.split(",")[2],
        dateRange.date.start.weekday
      ) > startWeek
  );
