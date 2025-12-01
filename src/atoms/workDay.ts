import { atom } from "jotai";
import type { ListWorkdaysForUser } from "src/generated/homeLambdasClient";

export const workDayAtom = atom<ListWorkdaysForUser[]>([]);
