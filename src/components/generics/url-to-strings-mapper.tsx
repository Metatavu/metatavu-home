import type strings from "src/localization/strings";

type KeysWithBack = {
  [K in keyof typeof strings]: (typeof strings)[K] extends { back: string }
    ? K
    : never;
}[keyof typeof strings];

/**
 * 
 * Generic mapper used to determine appropriate localized label for routes
 * 
 * Each key in record is a URL path segment (string),
 * and value is 'KeysWithBack' in strings.ts that contains back property
 * 
 * @param string - URL path segment
 * @param value - Corresponding module key in `strings` with `.back`
 */
export const urlToStringsKeyMap: Record<string, KeysWithBack> = {
  "wiki-documentation": "wikiDocumentation",
  softwareregistry: "softwareRegistry",
  sprintview: "sprint",
  questionnaire: "questionnaireScreen",
  vacations: "vacationsScreen",
  "vacation-management": "vacationsScreen",
  allsoftware: "softwareRegistry"
};

