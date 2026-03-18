import { atom } from "jotai";
import type { OnCall } from "src/generated/homeLambdasClient";

export const onCallAtom = atom<OnCall[]>([]);
