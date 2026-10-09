import type { VacationRequestStatuses, VacationType } from "src/generated/homeLambdasClient";

export type StatusFilter = "ALL" | "DRAFT" | VacationRequestStatuses;
export type TypeFilter = "ALL" | VacationType;

export type VacationFilters = {
  status: StatusFilter[];
  type: TypeFilter[];
};
