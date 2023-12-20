import { useAtomValue } from "jotai";
import { apiClientAtom, lambdaClientAtom } from "../atoms/api";

export const useApi = () => useAtomValue(apiClientAtom);
export const useLambdaApi = () => useAtomValue(lambdaClientAtom);
