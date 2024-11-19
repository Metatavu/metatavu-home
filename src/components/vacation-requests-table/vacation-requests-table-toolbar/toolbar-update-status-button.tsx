import { Check, Close } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { VacationRequestStatuses } from "src/generated/client";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface UpdateStatusButtonProps {
  // updateVacationRequestStatuses: (
  //   newStatus: VacationRequestStatuses
  // ) => Promise<VacationRequestStatuses>;
  selectedRowIds: GridRowId[];
  buttonType: VacationRequestStatuses;
}

/**
 * Status update button component
 *
 * @param props component properties
 */
const UpdateStatusButton = ({
  // updateVacationRequestStatuses,
  selectedRowIds,
  buttonType
}: UpdateStatusButtonProps) => {
  /**
   * Handle update vacation status
   */
  const handleUpdateVacationRequestStatus = async () => {
    // await updateVacationRequestStatuses(buttonType);
  };

  return (
    <Button variant="contained" fullWidth onClick={handleUpdateVacationRequestStatus}>
      {buttonType === VacationRequestStatuses.APPROVED ? <Check /> : <Close />}
      <Typography variant="body1">
        {buttonType === VacationRequestStatuses.APPROVED
          ? strings.toolbarUpdateStatusButton.approve
          : strings.toolbarUpdateStatusButton.decline}
      </Typography>
    </Button>
  );
};

export default UpdateStatusButton;
