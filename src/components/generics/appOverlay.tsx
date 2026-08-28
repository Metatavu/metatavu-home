import { Close } from "@mui/icons-material";
import { Box, Modal, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type AppOverlayProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
};

/**
 * A reusable overlay component for displaying content in a modal dialog.
 *
 * The overlay can be opened and closed using the `open` prop and `onClose`
 * callback. A close icon is displayed next to the title.
 *
 * @param props.children - Content displayed inside the overlay.
 * @param props.open - Determines whether the overlay is open.
 * @param props.onClose - Callback invoked when the overlay is closed.
 * @param props.title - Title displayed at the top of the overlay.
 *
 * @returns A modal overlay containing a title, close button, and custom content.
 */
const AppOverlay = ({ children, open, onClose, title }: AppOverlayProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          minWidth: 300
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Close onClick={onClose} sx={{ cursor: "pointer" }} />
        </Box>
        {children}
      </Paper>
    </Modal>
  );
};

export default AppOverlay;
