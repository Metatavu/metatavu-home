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
        const startDate = DateTime.fromJSDate(new Date(timespan[0])).toLocaleString(DateTime.DATE_SHORT);
        const endDate = DateTime.fromJSDate(new Date(timespan[1])).toLocaleString(DateTime.DATE_SHORT);
        
        return `${startDate} – ${endDate}`; // All time
      } else {
        return `${timespan[0]}/${timespan[1]}`; // Month
      }
    case 3:
      return `${timespan[0]}/${timespan[2]}`; // Week
    default:
      return null;
  }
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
