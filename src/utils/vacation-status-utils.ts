import { VacationRequestStatuses } from "../generated/homeLambdasClient";
import { theme } from "../theme";

/**
 * Get color code corresponding to the vacation request status
 *
 * @param vacationRequestStatus vacation request status
 * @returns color code as string
 */
export const getVacationRequestStatusColor = (vacationRequestStatus: VacationRequestStatuses) =>
  ({
    [VacationRequestStatuses.APPROVED]: theme.palette.success.main,
    [VacationRequestStatuses.DECLINED]: theme.palette.error.main,
    [VacationRequestStatuses.PENDING]: theme.palette.info.main
  })[vacationRequestStatus];
