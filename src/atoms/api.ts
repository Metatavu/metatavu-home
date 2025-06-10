import { atom } from "jotai";
import { getLambdasApiClient } from "../api/api";
import { authAtom } from "./auth";

export const apiLambdasClientAtom = atom((get) => getLambdasApiClient(get(authAtom)?.tokenRaw));