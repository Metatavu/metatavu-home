import type strings from "src/localization/strings";

type KeysWithBack = {
  [K in keyof typeof strings]: (typeof strings)[K] extends { back: string }
    ? K
    : never;
}[keyof typeof strings];

export const urlToStringsKeyMap: Record<string, KeysWithBack> = {
  "wiki-documentation": "wikiDocumentation",
  softwareregistry: "softwareRegistry",
  sprintview: "sprint",
  questionnaire: "questionnaireScreen",
  vacations: "vacationsScreen",
  "vacation-management": "vacationsScreen",
  allsoftware: "softwareRegistry"
};

