import { useSetAtom } from "jotai";
import { type SnackbarSeverity, snackbarAtom } from "src/atoms/snackbar";

export const useSnackbar = () => {
  const setSnackbar = useSetAtom(snackbarAtom);

  return (message: string, severity: SnackbarSeverity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
};
