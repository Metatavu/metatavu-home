//import { Timespan, VacationRequestStatuses, VacationType } from "../generated/client";

import { VacationRequestStatuses, VacationType } from "../generated/homeLambdasClient";
import strings from "../localization/strings";
/**
 * Localization Utils class
 */
export default class LocalizationUtils {
  /**
   * Get localized vacation request status
   *
   * @param vacationRequestStatus vacation request status
   */
  public static getLocalizedVacationRequestStatus = (
    vacationRequestStatus: VacationRequestStatuses
  ) =>
    ({
      [VacationRequestStatuses.PENDING]: strings.vacationRequest.pending,
      [VacationRequestStatuses.APPROVED]: strings.vacationRequest.approved,
      [VacationRequestStatuses.DECLINED]: strings.vacationRequest.declined,
      [VacationRequestStatuses.ONGOING]: strings.vacationRequest.ongoing,
      [VacationRequestStatuses.COMPLETED]: strings.vacationRequest.completed
    })[vacationRequestStatus];

  /**
   * Get localized vacation request type
   *
   * @param vacationType vacation type
   */
  public static getLocalizedVacationRequestType = (vacationType: VacationType) =>
    ({
      [VacationType.VACATION]: strings.vacationRequest.vacation
    })[vacationType];

  /**
   * Get localized timespan type
   *
   * @param timespanType timespan type
   */
  //   public static getLocalizedTimespan = (timespanType: Timespan) =>
  //     ({
  //       [Timespan.ALL_TIME]: strings.timeExpressions.allTime,
  //       [Timespan.MONTH]: strings.timeExpressions.month,
  //       [Timespan.WEEK]: strings.timeExpressions.week,
  //       [Timespan.YEAR]: strings.timeExpressions.year
  //     })[timespanType];
}
