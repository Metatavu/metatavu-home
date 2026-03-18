import { atom } from "jotai";
import type { User } from "src/generated/homeLambdasClient";

export const usersAtom = atom<User[]>([]);
