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
 * Extracts a display name from a user.
 *
 * Falls back to deriving a name from the email if firstName is missing,
 * because the backend API does not reliably return firstName
 * for all users
 *
 * @param user - The user object
 * @returns first name, or empty string if unavailable
 */
export const getDisplayName = (user?: User): string => {
  if (user?.firstName) {
    return user.firstName;
  }

  if (user?.email) {
    const localPart = user.email.split("@")[0];
    const withoutPrefix = localPart.replace(/^ext-/i, "");
    const firstPart = withoutPrefix.split(/[._]/)[0];
    return firstPart
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("-");
  }

  return "";
};
