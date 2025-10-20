import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "src/generated/homeLambdasClient/models/YearlyVacationDays";
import strings from "src/localization/strings";

/**
 * A mapping of years to their corresponding vacation data.
 */
export type VacationDays = Record<string, YearlyVacationDays>;

/**
 * Parses vacation day data from a User object into a structured VacationDays object.
 *
 * @param user - The user object containing encoded vacation day data.
 * @returns A VacationDays object with total and remaining vacation days for each year.
 */
export function parseVacationDays(user: User): VacationDays {
  const vacationDaysByYear = user.attributes?.vacationDaysByYear || [];
  const unspentVacationDaysByYear = user.attributes?.unspentVacationDaysByYear || [];

  const totalByYear: Record<string, number> = {};
  const remainingByYear: Record<string, number> = {};
  const vacationData: VacationDays = {};

  vacationDaysByYear.forEach((str) => {
    const [year, val] = str.split(":");
    if (year) totalByYear[year] = Number.parseInt(val, 10) || 0;
  });

  unspentVacationDaysByYear.forEach((str) => {
    const [year, val] = str.split(":");
    if (year) remainingByYear[year] = Number.parseInt(val, 10) || 0;
  });

  const allYears = new Set([...Object.keys(totalByYear), ...Object.keys(remainingByYear)]);

  allYears.forEach((year) => {
    vacationData[year] = {
      total: totalByYear[year] ?? 0,
      remaining: remainingByYear[year] ?? 0
    };
  });

  const currentYear = new Date().getFullYear().toString();
  if (!vacationData[currentYear]) {
    vacationData[currentYear] = { total: 0, remaining: 0 };
  }

  return vacationData;
}

/**
 * Converts a VacationDays object into a normalized payload format with non-negative numeric values.
 *
 * @param vacationDays - The VacationDays object.
 * @returns An object mapping years to validated numeric vacation totals and remaining days.
 */
export function formatVacationDaysPayload(vacationDays: VacationDays): VacationDays {
  const payload: VacationDays = {};

  Object.entries(vacationDays).forEach(([year, data]) => {
    payload[year] = {
      total: Math.max(0, data.total ?? 0),
      remaining: Math.max(0, data.remaining ?? 0)
    };
  });

  return payload;
}

/**
 * Validates if the vacation request uses more days than the user has.
 * @param requestedDays Number of days the user is trying to request
 * @param unspentDays Number of unspent vacation days the user has
 * @returns { valid: boolean, errorMessage?: string }
 */
export const validateVacationRequestDays = (
  requestedDays: number,
  unspentDays: number
): { valid: boolean; errorMessage?: string } => {
  if (requestedDays > unspentDays) {
    return {
      valid: false,
      errorMessage: strings.vacationRequestError.tooManyDaysRequested
        .replace("{requestedDays}", String(requestedDays))
        .replace("{unspentDays}", String(unspentDays))
    };
  }
  return { valid: true };
};
