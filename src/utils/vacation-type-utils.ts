import { VacationType } from "../generated/homeLambdasClient";

/**
 * Set the string to corresponding enum value
 *
 * @param typeString filter scope as string
 */
const getVacationTypeByString = (typeString: string) => {
  switch (typeString) {
    case "VACATION":
      return VacationType.VACATION;
    case "PARENTAL_LEAVE":
      return VacationType.PARENTAL_LEAVE;
    case "SICKNESS":
      return VacationType.SICKNESS;
    case "PERSONAL_DAYS":
      return VacationType.PERSONAL_DAYS;
    case "UNPAID_TIME_OFF":
      return VacationType.UNPAID_TIME_OFF;
    case "CHILD_SICKNESS":
      return VacationType.CHILD_SICKNESS;
    default:
      return undefined;
  }
};

export default getVacationTypeByString;
