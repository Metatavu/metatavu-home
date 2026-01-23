import { atom } from "jotai";
import type { SlackAvatarResponse } from "src/generated/homeLambdasClient";

export const avatarsAtom = atom<SlackAvatarResponse | undefined>(undefined);
