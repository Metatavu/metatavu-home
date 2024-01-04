import { DateTime, Duration } from "luxon";

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
export const getHoursAndMinutes = (minutes: number) => {
  if (minutes < 0) {
    return `-${Duration.fromObject({ minutes: minutes }).negate().toFormat("h 'h' m 'min'")}`;
  } else return Duration.fromObject({ minutes: minutes }).toFormat("h 'h' m 'min'");
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
 * @returns formatted timespan in the following formats (DD.MM.YYYY – DD.MM.YYYY), (YYYY/WW), (YYYY/MM), (YYYY)
 */
export const formatTimePeriod = (timespan: string[] | undefined) => {
  if (!timespan) return null;

  if (timespan[0].length > 4) {
    const startDate = DateTime.fromJSDate(new Date(timespan[0])).toLocaleString(
      DateTime.DATE_SHORT
    );
    const endDate = DateTime.fromJSDate(new Date(timespan[1])).toLocaleString(DateTime.DATE_SHORT);
    return `${startDate} – ${endDate}`; //All time
  } else if (timespan.length === 2 && timespan[0].length <= 4) {
    return `${timespan[0]}/${timespan[1]}`; //Month
  } else if (timespan.length === 3) {
    return `${timespan[0]}/${timespan[2]}`; //Week
  } else return `${timespan[0]}`; // Year
};

/**
 * Formats inputted value to double digits
 *
 * @param value
 * @returns value as double digits i.e 9 -> 09
 */
export const doubleDigitFormatter = (value: string | undefined) => {
  if (!value) return null;

  if (value.length < 2) return `0${value}`;
  else return value;
};

/**
 * Formats personTotalTime timePeriod attribute YYYY,MM,WW to ISO string and then to DateTime
 * 
 * @param year (YYYY),MM,WW
 * @param week YYYY,MM,(WW)
 * @param dayNumber Weekday number
 * @returns DateTime object
 */
export const getWeekFromISO = (year: string, week: string, dayNumber: number) => {
  const weekISO = `${year}-W${doubleDigitFormatter(week)}-${dayNumber}`
  const weekParsed = DateTime.fromISO(weekISO);
  return weekParsed;
};

/**
 * Get time difference in days
 *
 * @param startDate start date
 * @param endDate end date
 * @returns days
 */
export const getVacationDurationInDays = (startDate: DateTime, endDate: DateTime) => {
  let days;
  if (startDate && endDate) {
    const diff = endDate.diff(startDate, ["days"]);
    days = Number(Math.round(diff.days));
  }
  if ((days && days < 1) || !days) {
    days = 1;
  } else {
    days += 1;
  }
  return days;
};
