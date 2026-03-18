import { useAtomValue } from "jotai";
import { apiLambdasClientAtom } from "../atoms/api";

export const useLambdasApi = () => useAtomValue(apiLambdasClientAtom);
