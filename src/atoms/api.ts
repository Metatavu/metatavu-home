import { atom } from "jotai";
import { getApiClient } from "../api/api";
import { getLambdaClient } from "../api/home-api";
import { authAtom } from "./auth";

export const apiClientAtom = atom((get) => getApiClient(get(authAtom)?.tokenRaw));
export const lambdaClientAtom = atom((get) => getLambdaClient(get(authAtom)?.tokenRaw));