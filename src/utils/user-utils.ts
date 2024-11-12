import type { User } from "src/generated/homeLambdasClient/models/User";
import config from "src/app/config";

/**
 * To get the severa user id when logged in, if severaUserId is not found, it will return the test user severa id
 * @param user 
 * @returns 
 */
export const getSeveraUserId = (user: User | undefined): string => {
	if (user?.severaUserId) {
    return user.severaUserId;
  }
  const testUserSeveraId = config.user.testUserSeveraId || "";
  return testUserSeveraId;
};
