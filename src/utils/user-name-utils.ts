import type {User} from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Extracts a user's first and last name from an email address. Only processes emails in the format: `firstname.lastname@`. If has ext-firstname.lastname@ returns Ext-firstname and Lastname as username
 * @param email - The user's email address.
 * @returns An object containing `firstName` and `lastName`
 */
const parseNameFromEmail = (
  email?: string
): {
  firstName: string;
  lastName: string;
} => {
  if (!email) {
    return {
      firstName: "",
      lastName: ""
    };
  }

  const [usernamePart] = email.split("@");
  if (!usernamePart) {
    return {
      firstName: "",
      lastName: ""
    };
  }
  // split "firstname.lastname"
  const nameSegments = usernamePart.split(".").filter(Boolean);
  if (nameSegments.length < 2) {
    return { firstName: capitalize(nameSegments[0]), lastName: "" };
  }
  const [firstName, lastName] = nameSegments;

  return {
    firstName: capitalize(firstName),
    lastName: capitalize(lastName)
  };
};

/**
 * Capializes first letter of sting and lowercases the rest. To handle special case like "Ext-firstName lastName"
 * @param text- Text to capitalize
 * @returns Capitalized firstName
 */
const capitalize = (text:string) => {
  if(!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Gets the full name from a user object, with fallback to email parsing
 * Prioritizes firstName/lastName if they exist, otherwise parses from email
 * 
 * @param user - The user object
 * @returns Full name as a string
 */
export const getFullUserName = (user: User | undefined): string => {
  if(!user){
    return strings.softwareRegistry.errorUnknownUser;
  }
  if(user.firstName && user.lastName){
     return `${user.firstName} ${user.lastName}`.trim();
  }
  const {firstName, lastName} = parseNameFromEmail(user.email);
  if(firstName && lastName){
    return `${firstName} ${lastName}`.trim();
  }
  return user.email || strings.softwareRegistry.errorUnknownUser;
}

/**
 * Ensures a user object has 'firstName' and 'lastName' values.
 * If missing then only get from the email
 * @param user- The user object to process
 * @returns User Object with firstName and lastName
 */
export const userWithParsedName = (user: User) =>{
  if(user.firstName && user.lastName){
    return user;
  }
  const {firstName, lastName} = parseNameFromEmail(user.email);
  
  return{
    ...user,
    firstName: user.firstName || firstName,
    lastName: user.lastName || lastName
  };
};