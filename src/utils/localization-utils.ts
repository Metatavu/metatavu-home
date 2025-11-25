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
      [VacationRequestStatuses.DECLINED]: strings.vacationRequest.declined
    })[vacationRequestStatus];

  /**
   * Get localized vacation request type
   *
   * @param vacationType vacation type
   */
  public static getLocalizedVacationRequestType = (vacationType: VacationType) =>
    ({
      [VacationType.VACATION]: strings.vacationRequest.vacation
      // NOTE: The following types are not generated in homeLambdasClient, so they are uncommented out for now.
      // [VacationType.PERSONAL_DAYS]: strings.vacationRequest.personalDays,
      // [VacationType.UNPAID_TIME_OFF]: strings.vacationRequest.unpaidTimeOff,
      // [VacationType.MATERNITY_PATERNITY]: strings.vacationRequest.maternityPaternityLeave,
      // [VacationType.SICKNESS]: strings.vacationRequest.sickness,
      // [VacationType.CHILD_SICKNESS]: strings.vacationRequest.childSickness
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
