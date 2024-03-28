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

/**
 * Calculates vacation days
 *
 * @param vacationDayStart DateTime vacation start date
 * @param vacationDayEnd DateTime vacation end date
 * @param workingWeek list of booleans representing which days are working days
 */
export const calculateTotalVacationDays = (vacationStartDate: DateTime, vacationEndDate: DateTime, workingWeek: boolean[]) => {
  const vacationDayStart = vacationStartDate.weekday;
  const vacationDayEnd = vacationEndDate.weekday;
  const daysSelected = Number(Math.round(vacationEndDate.diff(vacationStartDate, ["days"]).days));
  const weeks = Math.floor(daysSelected/7);
  const [startWeek, endWeek] = getIndexDaysWorking(workingWeek);

  if (!startWeek || !endWeek) return 0; 
  if (daysSelected === 0) return singleVacationDaySelected(workingWeek[vacationDayStart-1], startWeek, endWeek);
  return multipleVacationDaysSelected(workingWeek, vacationDayStart, vacationDayEnd, startWeek, endWeek, weeks);
}

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
    if (!workingWeek[startIndex]) startIndex+=1;
    if (!workingWeek[endIndex]) endIndex-=1;
    if (workingWeek[startIndex] && workingWeek[endIndex]) return [startIndex+1, endIndex+1];
  }
  return [null, null];
} 

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
}

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
const multipleVacationDaysSelected = (workingWeek: boolean[], vacationDayStart: number, vacationDayEnd: number, startWeek: number, endWeek: number, weeks: number) => {
  const workDays = workingWeek.filter(workDay => workDay).length;
  const startsFromWorkingDay = workingWeek[vacationDayStart-1];

  if (vacationDayStart === vacationDayEnd) {
    if (!startsFromWorkingDay) return weeks * 6;
    // vacation starts and ends on working day
    return weeks * 6 + 1;
  }

  if (vacationDayEnd > vacationDayStart) {
    let takenWorkingDays = 0;
    // calculate the number of vacation days from start till the end of vacation if the number of weeks is not an integer
    for (let i = vacationDayStart; i <= vacationDayEnd; i++){
      if (workingWeek[i-1]) takenWorkingDays+=1;
    }
    if (takenWorkingDays === workDays) takenWorkingDays = 6;
    return weeks * 6 + takenWorkingDays;
  }

  let takenWorkingDays = 0;
  // calculate the number of vacation days from start vacation day till the end of working week if the number of weeks is not an integer
  for (let i = vacationDayStart; i <= endWeek; i++){
    if (workingWeek[i-1]) takenWorkingDays+=1;
  }
  // calculate the number of vacation days from start working week till the end of vacation if the number of weeks is not an integer
  for (let i = startWeek; i <= vacationDayEnd; i++){
    if (workingWeek[i-1]) takenWorkingDays+=1;
  }
  if (takenWorkingDays === workDays) takenWorkingDays = 6;
  return weeks * 6 + takenWorkingDays;
}