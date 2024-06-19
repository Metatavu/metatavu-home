import { atom } from "jotai";
import type { Allocations, Projects } from "src/generated/homeLambdasClient";
import type { PersonWithAllocations } from "../types";

export const timeEntriesAtom = atom<number[]>([]);
export const allocationsAtom = atom<Allocations[]>([]);
export const projectsAtom = atom<Projects[]>([]);
export const personsWithAllocationsAtom = atom<PersonWithAllocations[]>([]);
export const projectOptionsAtom = atom<Projects[]>([]);
