import type { VacationDays } from '../types';
import type { User } from '../types';

export function parseVacationDays(user: User): VacationDays {
  const vacationDaysByYear = user.attributes?.vacationDaysByYear || [];
  const unspentVacationDaysByYear = user.attributes?.unspentVacationDaysByYear || [];

  const totalByYear: Record<string, number> = {};
  const remainingByYear: Record<string, number> = {};
  const vacationData: VacationDays = {};

  vacationDaysByYear.forEach(str => {
    const [year, val] = str.split(':');
    if (year) totalByYear[year] = Number.parseInt(val, 10) || 0;
  });

  unspentVacationDaysByYear.forEach(str => {
    const [year, val] = str.split(':');
    if (year) remainingByYear[year] = Number.parseInt(val, 10) || 0;
  });

  const allYears = new Set([...Object.keys(totalByYear), ...Object.keys(remainingByYear)]);

  allYears.forEach(year => {
    vacationData[year] = {
      total: String(totalByYear[year] ?? 0),      // convert number to string
      remaining: String(remainingByYear[year] ?? 0), // convert number to string
    };
  });

  const currentYear = new Date().getFullYear().toString();
  if (!vacationData[currentYear]) {
    vacationData[currentYear] = { total: '0', remaining: '0' }; // strings here
  }

  return vacationData;
}

export function formatVacationDaysPayload(vacationDays: VacationDays): {
  [year: string]: { total: number; remaining: number };
} {
  const payload: { [year: string]: { total: number; remaining: number } } = {};

  Object.entries(vacationDays).forEach(([year, data]) => {
    payload[year] = {
      total: Math.max(0, Number(data.total) || 0),
      remaining: Math.max(0, Number(data.remaining) || 0),
    };
  });

  return payload;
}
