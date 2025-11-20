import type { VacationRequest } from "../generated/homeLambdasClient";
import type { KeycloakProfile } from "keycloak-js";
import {User} from "src/generated/homeLambdasClient";
import { getFullUserName } from "./user-name-utils";

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
  const user = users.find((user) => user.id === vacationRequest?.userId);

  return(getFullUserName(user));
};
