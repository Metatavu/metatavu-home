import { atom } from "jotai";
import { OnCallEntry } from "../types";
import { OnCall } from "../generated/client";

export const oncallAtom = atom<OnCall[]>([]);