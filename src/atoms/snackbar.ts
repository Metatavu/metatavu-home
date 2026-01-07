import { atom } from "jotai";

export type SnackbarSeverity = "success" | "error";

export const snackbarAtom = atom<{
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}>({
  open: false,
  message: "",
  severity: "success"
});
