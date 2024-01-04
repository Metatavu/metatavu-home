import { atom } from "jotai";
import { DailyEntry, Person, PersonTotalTime, Timespan } from "../generated/client";
import { DailyEntryWithIndexSignature, PersonWithTotalTime } from "../types";

export const personsAtom = atom<Person[]>([]);
export const personTotalTimeAtom = atom<PersonTotalTime | undefined>(undefined);
export const totalTimeAtom = atom<PersonTotalTime[]>([]);
export const personsWithTotalTimeAtom = atom<PersonWithTotalTime[]>([]);
export const timespanAtom = atom<Timespan>(Timespan.ALL_TIME);
export const personDailyEntryAtom = atom<DailyEntryWithIndexSignature | undefined>(undefined);
export const dailyEntriesAtom = atom<DailyEntry[]>([]);
