import type { User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Extracts a firstname from a user.
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
    const firstPart = parseFromEmail(user.email)[0];
    return firstPart;
  }

  return "";
};

/**
 * Parse name fro email
 *
 * @param email -user email
 * @returns name in array
 */
export const parseFromEmail = (email: string) => {
  const localPart = email.split("@")[0];
  const withoutPrefix = localPart.replace(/^ext-/i, "");
  const firstName = withoutPrefix.split(/[._]/)[0];
  const lastName = withoutPrefix.split(/[._]/)[1] || "";
  const nameArray = [firstName, lastName].map((name) => capitalize(name));

  return nameArray;
};

/**
 * Extracts a user's first and last name from an email address. Only processes emails in the format: `firstname.lastname@`.
 * @param email - The user's email address.
 * @returns An object containing `firstName` and `lastName`
 */
export const parseFullNameFromEmail = (email?: string) => {
  if (!email) {
    return {
      firstName: "",
      lastName: ""
    };
  }
  const [firstName, lastName] = parseFromEmail(email);

  return {
    firstName,
    lastName
  };
};
/**
 * Capializes first letter of name and lowercases the rest.
 * @param text- Text to capitalize
 * @returns Capitalized firstName
 */
const capitalize = (text: string) => {
  if (!text) return "";

  return text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
};

/**
 * Gets the full name from a user object, with fallback to email parsing
 * Prioritizes firstName/lastName if they exist, otherwise parses from email
 *
 * @param user - The user object
 * @returns Full name as a string
 */
export const getFullUserName = (user: User | undefined): string => {
  if (!user) {
    return strings.softwareRegistry.errorUnknownUser;
  }

  if (user.firstName?.trim() && user.lastName?.trim()) {
    return `${user.firstName.trim()} ${user.lastName.trim()}`;
  }

  const { firstName, lastName } = parseFullNameFromEmail(user.email);
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return user.email || strings.softwareRegistry.errorUnknownUser;
};

/**
 * Ensures a user object has 'firstName' and 'lastName' values.
 * If missing then only get from the email
 * @param user- The user object to process
 * @returns User Object with firstName and lastName
 */
export const userWithParsedName = (user: User) => {
  if (user.firstName && user.lastName) {
    return user;
  }
  const { firstName, lastName } = parseFullNameFromEmail(user.email);

  return {
    ...user,
    firstName: user.firstName || firstName,
    lastName: user.lastName || lastName
  };
};
