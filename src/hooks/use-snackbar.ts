import { useSetAtom } from "jotai";
import { snackbarAtom } from "src/atoms/snackbar";

export const useSnackbar = () => {
  const setSnackbar = useSetAtom(snackbarAtom);

  return (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbar({ open: true, message, severity });
  };
};
