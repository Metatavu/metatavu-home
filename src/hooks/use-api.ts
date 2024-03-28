import { useAtomValue } from "jotai";
import { apiClientAtom, apiLambasAtom } from "../atoms/api";

export const useApi = () => useAtomValue(apiClientAtom);
export const useLambdasApi = () => useAtomValue(apiLambasAtom);
