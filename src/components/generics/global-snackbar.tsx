import { Alert, Snackbar } from "@mui/material";
import { useAtom } from "jotai";
import { snackbarAtom } from "src/atoms/snackbar";

const GlobalSnackbar = () => {
  const [snackbar, setSnackbar] = useAtom(snackbarAtom);

  const handleClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  if (!snackbar.open) return null;

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          minWidth: 400,
          minHeight: 100,
          fontSize: "1.5rem",
          borderRadius: "16px"
        }
      }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity}
        sx={{
          width: "100%",
          fontSize: "1.5rem",
          py: 3,
          px: 4,
          borderRadius: 2
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
