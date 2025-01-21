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
    default:
      return undefined;
  }
};

export default getVacationTypeByString;
