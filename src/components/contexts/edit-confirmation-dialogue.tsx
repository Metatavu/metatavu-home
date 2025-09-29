import { useState } from "react";
import { Divider, Typography } from "@mui/material";
import GenericDialog from "../generics/generic-dialog";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface Props {
  open: boolean;
  setOpen: (confirmation: boolean) => void;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation handler component
 *
 * @param props component properties
 */
const EditConfirmationDialogue = ({ open, setOpen, onConfirm }: Props) => {
  const [loading, setLoading] = useState(false);

  /** Handler for confirm click
   */
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setOpen(false);
      setLoading(false);
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
      loading={loading}
    >
      <Typography marginBottom={3} sx={{ fontSize: 16, fontWeight: "bold" }}>
        {strings.confirmationHandler.editMessage}
      </Typography>
      <Divider />
    </GenericDialog>
  );
};

export default EditConfirmationDialogue;
