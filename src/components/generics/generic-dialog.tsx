import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import type { ReactNode } from "react";

/**
 * Component properties
 */
interface Props {
  title: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm?: () => void | Promise<void> | unknown;
  open: boolean;
  error?: boolean;
  fullScreen?: boolean;
  fullWidth?: boolean;
  disableEnforceFocus?: boolean;
  disabled?: boolean;
  ignoreOutsideClicks?: boolean;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

/**
 * Generic dialog component
 *
 * @param props component properties
 */
const GenericDialog = ({
  open,
  confirmButtonText,
  cancelButtonText,
  onClose,
  onCancel,
  title,
  onConfirm,
  error,
  fullScreen,
  fullWidth,
  maxWidth,
  disableEnforceFocus,
  disabled,
  ignoreOutsideClicks,
  children,
  loading
}: Props) => {
  /**
   * Event handler for on close click
   *
   * @param event event source of the callback
   * @param reason reason why dialog was closed
   */
  const onCloseClick = (reason: string) => {
    if (!ignoreOutsideClicks || (reason !== "backdropClick" && reason !== "escapeKeyDown")) {
      onClose();
    }
  };

  /**
   * Component render
   */
  return (
    <Dialog
      open={open}
      onClose={onCloseClick}
      fullScreen={fullScreen}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      disableEnforceFocus={disableEnforceFocus}
    >
      {loading ? (
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={36} />
          </Box>
        </DialogContent>
      ) : (
        <>
          <DialogTitle>
            {title}
            <IconButton aria-label="close" size="small" onClick={onCancel}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Box p={3}>{children}</Box>
          </DialogContent>
        </>
      )}
      <DialogActions>
        {cancelButtonText && <Button onClick={onClose}>{cancelButtonText}</Button>}
        {confirmButtonText && (
          <Button
            variant="contained"
            disabled={error || disabled || loading}
            onClick={onConfirm}
            color="primary"
            autoFocus
          >
            {confirmButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenericDialog;
