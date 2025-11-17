import { Check, Close } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import {VacationRequestStatuses} from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getVacationRequestStatusColor } from "src/utils/vacation-status-utils";

/**
 * Component
 */
interface UpdateStatusButtonProps {
  selectedRowIds: GridRowId[];
  buttonType: VacationRequestStatuses;
  updateVacationRequestStatus: (
    vacationRequestStatus: VacationRequestStatuses,
    selectedRowsId: GridRowId[]
  ) => Promise<void>;
}

const UpdateStatusButton = ({
  buttonType,
  selectedRowIds,
  updateVacationRequestStatus
}: UpdateStatusButtonProps) => {
  const isApprove = buttonType === VacationRequestStatuses.APPROVED;
  // Handle update vacation status
  const handleUpdateVacationRequestStatus = async () => {
    await updateVacationRequestStatus(buttonType, selectedRowIds);
  };
  /**
   * Get button color with hover state
   */
  const getButtonColor = () => {
    const baseColor = getVacationRequestStatusColor(buttonType);
    const hoverColor = isApprove 
      ? '#45a049'  
      : '#da190b'; 

    return { base: baseColor, hover: hoverColor };
  };

  const colors = getButtonColor();


  return (
    <Button 
    variant="contained"
    fullWidth
    onClick={handleUpdateVacationRequestStatus}
    sx={{backgroundColor: isApprove ? "#4caf50" : "#f44336",
        "&:hover": {
          backgroundColor: isApprove ? "#45a049" : "#da190b"}}}>
      {buttonType === VacationRequestStatuses.APPROVED ? <Check /> : <Close />}
      <Typography variant="body1">
        {isApprove
          ? strings.toolbarUpdateStatusButton.approve
          : strings.toolbarUpdateStatusButton.decline}
      </Typography>
    </Button>
  );
};

export default UpdateStatusButton;
