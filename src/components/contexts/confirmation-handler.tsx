import { Divider, Typography } from "@mui/material";
import strings from "src/localization/strings";
import GenericDialog from "../generics/generic-dialog";

/**
 * Component properties
 */
interface Props {
  open: boolean;
  setOpen: (confirmation: boolean) => void;
  deleteVacationsData: () => void;
}

/**
 * Confirmation handler component
 *
 * @param props component properties
 */
const ConfirmationHandler = ({ open, setOpen, deleteVacationsData }: Props) => {
  return (
    <GenericDialog
      open={open}
      error={false}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onConfirm={() => {
        setOpen(false);
        deleteVacationsData();
      }}
      confirmButtonText={strings.confirmationHandler.confirmButtonText}
      cancelButtonText={strings.confirmationHandler.cancelButtonText}
      title={strings.confirmationHandler.title}
    >
      {
        <Typography marginBottom={3} sx={{ fontSize: 16, fontWeight: "bold" }}>
          {strings.confirmationHandler.message}
        </Typography>
      }
      <Divider />
    </GenericDialog>
  );
};

export default ConfirmationHandler;
