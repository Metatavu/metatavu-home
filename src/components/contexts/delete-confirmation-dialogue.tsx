import { Divider, Typography } from "@mui/material";
import strings from "src/localization/strings";
import type { DeleteItemType } from "src/types";
import GenericDialog from "../generics/generic-dialog";

/**
 * Component properties
 */
interface Props {
  open: boolean;
  setOpen: (confirmation: boolean) => void;
  onConfirm: () => void | Promise<void>;
  deleteType: DeleteItemType;
}

/**
 * Confirmation handler component
 *
 * @param props component properties
 */
const DeleteConfirmationDialog = ({ open, setOpen, onConfirm, deleteType }: Props) => {
  const message = strings.confirmationHandler.delete[deleteType];

  /**
   * Handler for confirm click
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      setOpen(false);
    }
  };

  return (
    <GenericDialog
      open={open}
      error={false}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onConfirm={handleConfirm}
      confirmButtonText={strings.confirmationHandler.confirmButtonText}
      cancelButtonText={strings.confirmationHandler.cancelButtonText}
      title={strings.confirmationHandler.title}
    >
      {
        <Typography marginBottom={3} sx={{ fontSize: 16, fontWeight: "bold" }}>
          {message}
        </Typography>
      }
      <Divider />
    </GenericDialog>
  );
};

export default DeleteConfirmationDialog;
