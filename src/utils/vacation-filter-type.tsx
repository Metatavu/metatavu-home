import type { VacationRequestStatuses, VacationType } from "src/generated/homeLambdasClient";

export const ALL_STATUSES = "ALL_STATUSES" as const;
export const ALL_TYPES = "ALL_TYPES" as const;

export type StatusFilter = typeof ALL_STATUSES | "DRAFT" | VacationRequestStatuses;
export type TypeFilter = typeof ALL_TYPES | VacationType;

export type VacationFilters = {
  status: StatusFilter[];
  type: TypeFilter[];
};
