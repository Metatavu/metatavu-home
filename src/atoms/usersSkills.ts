import { atom } from "jotai";
import type { UsersSkills } from "../generated/homeLambdasClient";

export const usersSkillsAtom = atom<UsersSkills[]>([]);

export const displayedUsersSkillsAtom = atom<UsersSkills[]>([]);
