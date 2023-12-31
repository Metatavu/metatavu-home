import { atom } from "jotai";
import { getApiClient } from "../api/api";
import { authAtom } from "./auth";

export const apiClientAtom = atom((get) => getApiClient(get(authAtom)?.tokenRaw));
