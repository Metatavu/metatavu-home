import { atom } from "jotai";
import type { SlackAvatar } from "../types";

export const avatarsAtom = atom<SlackAvatar | undefined>(undefined);
