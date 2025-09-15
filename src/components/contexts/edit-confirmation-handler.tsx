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
const EditConfirmationHandler = ({ open, setOpen, onConfirm }: Props) => {
  return (
    <GenericDialog
      open={open}
      error={false}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onConfirm={async () => {
        setOpen(false);
        await onConfirm();
      }}
      confirmButtonText={strings.confirmationHandler.confirmButtonText}
      cancelButtonText={strings.confirmationHandler.cancelButtonText}
      title={strings.confirmationHandler.title}
    >
      {
        <Typography marginBottom={3} sx={{ fontSize: 16, fontWeight: "bold" }}>
          {strings.confirmationHandler.editMessage}
        </Typography>
      }
      <Divider />
    </GenericDialog>
  );
};

export default EditConfirmationHandler;
