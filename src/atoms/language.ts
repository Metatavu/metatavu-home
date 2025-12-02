import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import strings from "src/localization/strings";
import type { Language } from "src/types";

const defaultLanguage = navigator.language === "fi" ? strings.getLanguage() : "en-gb";
const languageAtomBase = atomWithStorage<Language>("language", defaultLanguage as Language);

export const languageAtom = atom(
  (get) => {
    const language = get(languageAtomBase);
    if (language !== strings.getLanguage()) strings.setLanguage(language);
    return language;
  },
  (_, set, language: Language) => {
    strings.setLanguage(language);
    set(languageAtomBase, language);
  }
);
