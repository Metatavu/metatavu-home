import config from "src/app/config";
import type { User } from "src/generated/homeLambdasClient/models/User";

/**
 * To get the severa user id when logged in, if severaUserId is not found and in develop mode, it will return the test user severa id
 *
 * @param user
 * @returns user severaUserId or testUserSeveraId
 */
export const getSeveraUserId = (user: User | undefined): string => {
  const severaUserId = user?.attributes?.severaUserId;

  if (!severaUserId) {
    if (import.meta.env.MODE === "development") {
      return config.user.testUserSeveraId ?? "";
    }
    return "";
  }
  return severaUserId;
};

/**
 * Check if a user is opted in (has a real Severa user ID, without dev fallbacks)
 *
 * @param user
 * @returns true if user has a real severaUserId
 */
export const isUserOptedIn = (user: User | undefined): boolean => {
  const severaUserId = user?.attributes?.severaUserId;
  return !!severaUserId;
};

