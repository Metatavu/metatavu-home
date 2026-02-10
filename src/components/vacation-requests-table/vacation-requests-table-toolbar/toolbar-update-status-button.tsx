import { Check, Close } from "@mui/icons-material";
import { Button, Typography, useTheme } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Component properties
 */
interface UpdateStatusButtonProps {
  selectedRowIds: GridRowId[];
  buttonType: VacationRequestStatuses;
  updateVacationRequestStatus: (
    vacationRequestStatus: VacationRequestStatuses,
    selectedRowsId: GridRowId[]
  ) => Promise<void>;
}

/**
 * Status update button component
 *
 * @param props component properties
 */
const UpdateStatusButton = ({
  buttonType,
  selectedRowIds,
  updateVacationRequestStatus
}: UpdateStatusButtonProps) => {
  const theme = useTheme();
  
  const isApproved = buttonType === VacationRequestStatuses.APPROVED;
  const handleUpdateVacationRequestStatus = async () => {
    await updateVacationRequestStatus(buttonType, selectedRowIds);
  };

  return (
    <Button
      variant="contained"
      fullWidth
      onClick={handleUpdateVacationRequestStatus}
      sx={{
        backgroundColor: isApproved ? theme.palette.success.main : theme.palette.error.main,
        color: isApproved ? theme.palette.success.contrastText : theme.palette.error.contrastText,
        "&:hover": {
          backgroundColor: isApproved ? theme.palette.success.dark : theme.palette.error.dark
        }
      }}
    >
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
