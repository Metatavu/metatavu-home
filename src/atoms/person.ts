import { atom } from "jotai";
import { DailyEntry, Person, PersonTotalTime, Timespan } from "../generated/client";

export const personsAtom = atom<Person[]>([]);
export const personTotalTimeAtom = atom<PersonTotalTime | undefined>(undefined);
export const totalTimeAtom = atom<PersonTotalTime[]>([]);
export const timespanAtom = atom<Timespan>(Timespan.ALL_TIME);
export const personDailyEntryAtom = atom<DailyEntry | undefined>(undefined);
export const dailyEntriesAtom = atom<DailyEntry[]>([]);
export const employmentYearsAtom = atom<String[]>([]);
