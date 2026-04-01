import { atom } from "jotai";
import type { Questionnaire } from "src/generated/homeLambdasClient";

export const questionnairesAtom = atom<Questionnaire[] | null>(null);
export const questionnaireTagsAtom = atom<string[]>([]);
