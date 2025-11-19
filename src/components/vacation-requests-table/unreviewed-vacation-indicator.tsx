import { Box, Tooltip } from "@mui/material";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getVacationRequestStatusColor } from "src/utils/vacation-status-utils";

/**
 * Unreviewed Indicator Component
 * Shows a pulsing orange dot for vacation requests that haven't been reviewed by admin
 */

const UnreviewedIndicator = () => {
  return (
    <Tooltip title={strings.vacationRequest.noReview} arrow placement="top">
      <Box
        sx={{
          width: 8,
          height: 8,
          backgroundColor: getVacationRequestStatusColor(VacationRequestStatuses.PENDING),
          borderRadius: "50%",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              opacity: 1
            },
            "50%": {
              opacity: 0.5
            }
          }
        }}
      />
    </Tooltip>
  );
};

export default UnreviewedIndicator;
