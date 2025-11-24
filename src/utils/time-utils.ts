import { DateTime, Duration } from "luxon";
import type { User } from "src/generated/homeLambdasClient";
import { theme } from "../theme.tsx";

/**
 * Format date
 *
 * @param date datetime object
 * @param dateWithTime datetime object with time
 * @returns formatted date time
 */
export const formatDate = (date: DateTime, dateWithTime?: boolean) => {
  if (!date) return "";

  return date.toLocaleString(dateWithTime ? DateTime.DATETIME_SHORT : undefined);
};

/**
 * Converts inputted minutes into hours and minutes
 *
 * @param minutes value in minutes
 * @returns inputted minute value in X h Y min format as string
 */
export const getHoursAndMinutes = (hours: number): string => {
  const isNegative = hours < 0;
  const totalMinutes = Math.round(Math.abs(hours) * 60);
  const duration = Duration.fromObject({ minutes: totalMinutes });
  const formatted = duration.toFormat("h 'h' m 'min'");

  return isNegative ? `-${formatted}` : formatted;
};

/**
 * Converts inputted minutes into full hours
 *
 * @param minutes value in minutes
 * @returns inputted minute value in X h
 */
export const getHours = (minutes: number) =>
  Duration.fromObject({ minutes: minutes }).toFormat("h 'h'");

/**
 * Formats inputted time period from @PersonTotalTime
 *
 * @param timespan time period
 * @returns formatted timespan in the following formats (DD.MM.YYYY – DD.MM.YYYY), (YYYY/WW), (YYYY/MM)
 */
export const formatTimePeriod = (timespan: string[] | undefined) => {
  if (!timespan) {
    return null;
  }

  switch (timespan.length) {
    case 1:
      return `${timespan[0]}`; // Year
    case 2:
      if (timespan[0].length > 4) {
        const startDate = DateTime.fromJSDate(new Date(timespan[0])).toLocaleString(
          DateTime.DATE_SHORT
        );
        const endDate = DateTime.fromJSDate(new Date(timespan[1])).toLocaleString(
          DateTime.DATE_SHORT
        );

        return `${startDate} – ${endDate}`; // All time
      }
      return `${timespan[0]}/${timespan[1]}`; // Month
    case 3:
      return `${timespan[0]}/${timespan[2]}`; // Week
    default:
      return null;
  }
};

/**
 * Calculates vacation days
 *
 * @param vacationStartDate DateTime vacation start date
 * @param vacationEndDate DateTime vacation end date
 * @param workingWeek list of booleans representing which days are working days
 */
export const calculateTotalVacationDays = (
  vacationStartDate: DateTime,
  vacationEndDate: DateTime,
  workingWeek: boolean[]
) => {
  const vacationDayStart = vacationStartDate.weekday;
  const vacationDayEnd = vacationEndDate.weekday;
  const daysSelected = Number(Math.round(vacationEndDate.diff(vacationStartDate, ["days"]).days));
  const weeks = Math.floor(daysSelected / 7);
  const [startWeek, endWeek] = getIndexDaysWorking(workingWeek);

  if (!startWeek || !endWeek) return 0;
  if (daysSelected === 0)
    return singleVacationDaySelected(workingWeek[vacationDayStart - 1], startWeek, endWeek);
  return multipleVacationDaysSelected(
    workingWeek,
    vacationDayStart,
    vacationDayEnd,
    startWeek,
    endWeek,
    weeks
  );
};

/**
 * Calculates new endDate for vacation request after admin has updated the days count
 *
 * @param startDate - The starting date as a Luxon `DateTime`.
 * @param totalDays - The total number of vacation days to count.
 * @param workWeek - An array of 7 booleans (index 0 = Monday, index 6 = Sunday)
 *                   indicating which days are considered working days.
 * @returns A Luxon `DateTime` representing the calculated end date.
 */
export const calculateEndDateFromDays = (
  startDate: DateTime,
  totalDays: number,
  workWeek: boolean[]
) => {
  const workDaysInWeek = workWeek.filter(Boolean).length;
  let daysAdded = 0;
  let currentDate = startDate;
  const [startWeek, endWeek] = getIndexDaysWorking(workWeek);
  if (!startWeek || !endWeek) return startDate;
  while (daysAdded < totalDays) {
    const weekdayIndex = currentDate.weekday;
    const isWorkingDay = workWeek[weekdayIndex - 1];
    const reachedTotal = daysAdded >= totalDays;
    const endOfWorkWeek = daysAdded % workDaysInWeek === 0;
    if (isWorkingDay) {
      daysAdded++;
    }
    if (!reachedTotal && endOfWorkWeek && isWorkingDay) {
      daysAdded++;
    }
    if (!reachedTotal) {
      currentDate = currentDate.plus({ days: 1 });
    }
  }
  return currentDate;
};

/**
 * Get indexes - start and end day of working week
 *
 * @param workingWeek list of booleans representing which days are working days
 * @returns start/end indexes representing start/end days of the working week
 */
const getIndexDaysWorking = (workingWeek: boolean[]) => {
  let startIndex = 0;
  let endIndex = 6;
  while (true) {
    if (startIndex > 6 || endIndex < 0) break;
    if (!workingWeek[startIndex]) startIndex += 1;
    if (!workingWeek[endIndex]) endIndex -= 1;
    if (workingWeek[startIndex] && workingWeek[endIndex]) return [startIndex + 1, endIndex + 1];
  }
  return [null, null];
};

/**
 * Get vacation days if one day is chosen
 *
 * @param workDay represents if person works in a week day
 * @param startWeek index of a start working week
 * @param endWeek index of the end working week
 */
const singleVacationDaySelected = (workDay: boolean, startWeek: number, endWeek?: number) => {
  if (!workDay) return 0;
  if (endWeek === startWeek) return 6;
  return 1;
};

/**
 * Get vacation days if multiple days are chosen
 *
 * @param workingWeek list of booleans representing which days are working days
 * @param vacationDayStart start week index of vacation
 * @param vacationDayEnd end week index of vacation
 * @param startWeek index of a start week day
 * @param endWeek index of the end week
 * @param weeks number of weeks
 */
const multipleVacationDaysSelected = (
  workingWeek: boolean[],
  vacationDayStart: number,
  vacationDayEnd: number,
  startWeek: number,
  endWeek: number,
  weeks: number
) => {
  const workDays = workingWeek.filter((workDay) => workDay).length;
  const startsFromWorkingDay = workingWeek[vacationDayStart - 1];

  if (vacationDayStart === vacationDayEnd) {
    // if number of weeks is an integer
    return calculateVacationDurationInWeeks(startsFromWorkingDay, weeks);
  }

  if (vacationDayEnd > vacationDayStart) {
    // calculate the number of vacation days from start till the end of vacation if the number of weeks is not an integer
    let takenWorkingDays = countWorkingWeekDaysInRange(
      vacationDayStart,
      vacationDayEnd,
      workingWeek
    );
    if (takenWorkingDays === workDays) takenWorkingDays = 6;
    return weeks * 6 + takenWorkingDays;
  }

  // calculate the number of vacation days from start vacation day till the end of working week and from start working week till the end of vacation if the number of weeks is not an integer
  let takenWorkingDays =
    countWorkingWeekDaysInRange(vacationDayStart, endWeek, workingWeek) +
    countWorkingWeekDaysInRange(startWeek, vacationDayEnd, workingWeek);
  if (takenWorkingDays === workDays) takenWorkingDays = 6;
  return weeks * 6 + takenWorkingDays;
};

/**
 * Get vacation days based on the number of weeks, considering if it starts from a working day
 *
 * @param startsFromWorkingDay represents if the choosen start date is a working day
 * @param weeks number of weeks
 */
const calculateVacationDurationInWeeks = (startsFromWorkingDay: boolean, weeks: number) => {
  if (!startsFromWorkingDay) return weeks * 6;
  return weeks * 6 + 1;
};

/**
 * Calculate number of working days within a range of week indexes
 *
 * @param startWeekIndex represents start week date of range
 * @param endWeekIndex represents end week date of range
 * @param workingWeek list of booleans representing which days are working days
 */
const countWorkingWeekDaysInRange = (
  startWeekIndex: number,
  endWeekIndex: number,
  workingWeek: boolean[]
) => {
  let takenWorkingDays = 0;
  for (let i = startWeekIndex; i <= endWeekIndex; i++) {
    if (workingWeek[i - 1]) takenWorkingDays += 1;
  }
  return takenWorkingDays;
};

/**
 * Get sprint start date
 *
 * @param date string date
 */
export const getSprintStart = (date: string) => {
  const weekIndex = DateTime.fromISO(date).localWeekNumber;
  const weekDay = DateTime.fromISO(date).weekday;
  const days = (weekIndex % 2 === 1 ? 0 : 7) + weekDay;

  return DateTime.fromISO(date).minus({ days: days - 1 });
};

/**
 * Get sprint end date
 *
 * @param date string date
 */
export const getSprintEnd = (date: string) => {
  return getSprintStart(date).plus({ days: 11 });
};

/**
 * Calculate color for vacation days from vacation days
 *
 * @param user Keycloak user
 */
export const getVacationColors = (user: User) => {
  let vacationDaysByYearColor = theme.palette.error.main;
  let unspentVacationDaysByYearColor = theme.palette.error.main;
  const currentYear = new Date().getFullYear();

  if (
    user.attributes?.vacationDaysByYear &&
    parseVacationDays(user.attributes?.vacationDaysByYear)[currentYear] > 0
  ) {
    vacationDaysByYearColor = theme.palette.success.main;
  }
  if (
    user.attributes?.unspentVacationDaysByYear &&
    parseVacationDays(user.attributes?.unspentVacationDaysByYear)[currentYear] > 0
  ) {
    unspentVacationDaysByYearColor = theme.palette.success.main;
  }
  return {
    vacationDaysByYearColor,
    unspentVacationDaysByYearColor
  };
};

/**
 * Parsing vacationDaysByYear from format ("YYYY:DDD") to object {[year: string]: [days: number]}
 *
 * @param vacationDaysByYear A list of strings with years and corresponding number of vacation days
 */
export const parseVacationDays = (vacationDaysByYear: string[]): { [year: string]: number } => {
  return vacationDaysByYear.reduce(
    (acc, entry) => {
      const [year, days] = entry.split(":");
      acc[year] = Number.parseInt(days, 10);
      return acc;
    },
    {} as { [year: string]: number }
  );
};

/**
 * Convert numeric contracted week (1-7 = Mon-Sun) to a boolean[7] array.
 *
 * @param week numeric array of working days
 * @returns boolean array of full week
 */
export const contractedWeekToBoolean = (week: number[]): boolean[] => {
  const result = new Array(7).fill(false);

  week.forEach((dayNumber) => {
    if (dayNumber >= 1 && dayNumber <= 7) {
      result[dayNumber - 1] = true;
    }
  });

  return result;
};
