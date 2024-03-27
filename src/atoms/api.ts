import { atom } from "jotai";
import { getApiClient } from "../api/api";
import { authAtom } from "./auth";
import { getLambdasClient } from "../api/home-lambdas-api";

export const apiClientAtom = atom((get) => getApiClient(get(authAtom)?.tokenRaw));
export const apiLambasAtom = atom((get) => getLambdasClient(get(authAtom)?.tokenRaw));
