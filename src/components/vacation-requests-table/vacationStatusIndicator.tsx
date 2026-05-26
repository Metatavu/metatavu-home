import { Box, Tooltip, useTheme } from "@mui/material";
import type { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { getBadgeColor } from "src/utils/badgeColorUtils";

/**
 * VacationStatusIndicator
 * A small pulsing circular indicator representing a vacation request has not yet been reviewed.
 */
interface StatusIndicatorProps {
  statusColor: VacationRequestStatuses;
}
const vacationStatusIndicator = ({ statusColor }: StatusIndicatorProps) => {
  const theme = useTheme();
  const colors = getBadgeColor(statusColor, theme);

  return (
    <Tooltip title="status" placement="top">
      <Box
        sx={{
          width: 8,
          height: 8,
          backgroundColor: colors?.indicatorColor,
          borderRadius: "50%",
          animation: statusColor === "PENDING" ? "pulse 2s infinite" : "none",
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

export default vacationStatusIndicator;
