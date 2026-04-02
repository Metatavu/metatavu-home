import { getDays } from "src/components/screens/admin-vacation-management/UserRow";
import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "src/generated/homeLambdasClient/models/YearlyVacationDays";
import strings from "src/localization/strings";

/**
 * A mapping of years to their corresponding vacation data.
 */
export type VacationDays = Record<string, YearlyVacationDays>;

/**
 * Gets the correct vacation year based on the vacation requested month.
 * January-March(Previous year), April-December(Current year)
 * @param date - Optional date to check. Defaults to current date.
 * @returns The vacation year as a number.
 */
export const getVacationYear = (date: Date = new Date()): number => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month < 3) {
    return year - 1;
  }

  return year;
};

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

  const currentYear = getVacationYear().toString();
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
 * Checks if there is enough vacation time available for a requested number of days.
 * @param requestedDays Number of days the user is trying to request
 * @param unspentDays Number of unspent vacation days the user has
 * @returns { valid: boolean, errorMessage?: string }
 */
export const validateVacationRequestDays = (
  requestedDays: number,
  unspentDays: number,
  isUserAdmin?: boolean
): { valid: boolean; errorMessage?: string } => {
  if (unspentDays === 0 && requestedDays > 0) {
    return {
      valid: false,
      errorMessage: strings.vacationRequestError.noVacationDaysAvailable
    };
  }

  if (requestedDays > unspentDays) {
    const formatted = strings.formatString(
      isUserAdmin
        ? strings.vacationRequestError.tooManyDaysRequestedAdmin
        : strings.vacationRequestError.tooManyDaysRequestedUser,
      {
        requestedDays,
        unspentDays
      }
    );

    const errorString = Array.isArray(formatted) ? formatted.join("") : (formatted ?? "");

    return {
      valid: false,
      errorMessage: errorString
    };
  }
  if (requestedDays <= 0) {
    const errorMessage = isUserAdmin
      ? strings.vacationRequestError.invalidNumberOfDaysAdmin
      : strings.vacationRequestError.invalidNumberOfDaysUser;
    return {
      valid: false,
      errorMessage: errorMessage
    };
  }
  return { valid: true };
};

/**
 * Validates a user's vacation request based on available unspent vacation days.
 *
 * @param userToValidate - The user whose vacation request is being validated.
 * @param vacationRequestData - Object containing the number of requested vacation days.
 * @param currentYear - The current year as a string, used to check unspent vacation days.
 * @param setError - Function to set an error message if the request is invalid.
 * @param setLoading - Function to set the loading state.
 * @returns `true` if the vacation request is valid; `false` otherwise.
 */
export const validateUserVacationRequest = (
  userToValidate: User | undefined,
  vacationRequestData: { days?: number | string | null },
  currentYear: string,
  setError: (msg: string) => void,
  setLoading: (loading: boolean) => void,
  isUserAdmin?: boolean
): boolean => {
  const unspentDays = Number(
    getDays(userToValidate?.attributes?.unspentVacationDaysByYear, currentYear)
  );
  const requestedDays = Number(vacationRequestData.days ?? 0);

  const { valid, errorMessage } = validateVacationRequestDays(
    requestedDays,
    unspentDays,
    isUserAdmin
  );

  if (!valid) {
    setError(errorMessage || "");
    setLoading(false);
    return false;
  }

  return true;
};
