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
  deleteTitle?: string;
}

/**
 * Delete confirmation dialog component
 *
 * @param props component properties
 */
const DeleteConfirmationDialog = ({ open, setOpen, onConfirm, deleteType, deleteTitle }: Props) => {
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
          {strings.confirmationHandler.delete[deleteType].replace(
            "{deleteTitle}",
            deleteTitle || ""
          )}
        </Typography>
      }
      <Divider />
    </GenericDialog>
  );
};

export default DeleteConfirmationDialog;
