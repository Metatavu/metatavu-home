import { Box, Tooltip, useTheme } from "@mui/material";
import type { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { getBadgeColor } from "src/utils/badgeColorUtils";

interface StatusIndicatorProps {
  statusColor: VacationRequestStatuses;
  disabled?: string;
}

/**
 * Status indicator for vacations badges.
 *
 * A small indicator matching the color if vacation approval status.
 * To indicate vacation request has not yet been reviewed, the indicator is pulsing.
 *
 * @param props - VacationStatusIndicator props
 * @param props.statusColor - a VacataionRequestStatuses type to define colour
 * of the indicator based on the status
 * @returns Themed MUI ToolTip component
 */
const VacationStatusIndicator = ({ statusColor, disabled }: StatusIndicatorProps) => {
  const theme = useTheme();
  const color = disabled || statusColor;
  const colors = getBadgeColor(color, theme);

  return (
    <Tooltip title="status" placement="top">
      <Box
        sx={{
          width: 8,
          height: 8,
          backgroundColor: colors?.indicatorColor,
          borderRadius: "50%",
          animation: color === "PENDING" ? "pulse 2s infinite" : "none",
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

export default VacationStatusIndicator;
