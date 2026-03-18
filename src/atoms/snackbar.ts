import { atom } from "jotai";

export const snackbarAtom = atom<{
  open: boolean;
  message: string;
  severity?: "success" | "error" | "info" | "warning";
}>({
  open: false,
  message: "",
  severity: "success"
});
