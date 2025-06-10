import { atom } from "jotai";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";

export const softwareAtom = atom<SoftwareRegistry[]>([]);