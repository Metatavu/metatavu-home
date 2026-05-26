import type { VacationRequestStatus } from "../generated/homeLambdasClient";
import { VacationRequestStatuses } from "../generated/homeLambdasClient";

/**
 * Get color code corresponding to the vacation request status
 *
 * @param statuses array of vacation request statuses
 * @returns final status of the vacation request
 */
export const getTotalVacationRequestStatus = (statuses: VacationRequestStatus[]) => {
  if (statuses.some((status) => status.status === VacationRequestStatuses.APPROVED)) {
    return VacationRequestStatuses.APPROVED;
  } else if (statuses.some((status) => status.status === VacationRequestStatuses.DECLINED)) {
    return VacationRequestStatuses.DECLINED;
  } else {
    return VacationRequestStatuses.PENDING;
  }
};
