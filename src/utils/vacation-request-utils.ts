import type { VacationRequest } from "../generated/homeLambdasClient";
import type { KeycloakProfile } from "keycloak-js";
import strings from "../localization/strings";
import {User} from "src/generated/homeLambdasClient";

/**
 * Get vacation request person full name
 * Match keycloak id from persons with vacation request id or user profile id
 *
 * @returns person full name as string
 * @param vacationRequest vacation request
 * @param users an array of users
 * @param userProfile user`s profile from Keycloak
 */
export const getVacationRequestPersonFullName = (
  vacationRequest: VacationRequest,
  users: User[],
  userProfile?: KeycloakProfile | undefined
) => {
  let userFullName = strings.vacationRequestError.nameNotFound;
  const foundUser = users.find((user) => user.id === vacationRequest?.userId);

  if (foundUser) {
    userFullName = `${foundUser.firstName} ${foundUser.lastName}`;
  } else if (userProfile && userProfile.id === vacationRequest.userId) {
    userFullName = `${userProfile.firstName} ${userProfile.lastName}`;
  }

  return userFullName;
};
