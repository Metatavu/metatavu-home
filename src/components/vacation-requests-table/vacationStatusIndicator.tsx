import { Box, Tooltip, useTheme } from "@mui/material";
import type { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { getBadgeColor } from "src/utils/badgeColorUtils";

export type IndicatorColor = VacationRequestStatuses | "disabled";
interface StatusIndicatorProps {
  status: IndicatorColor;
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
const VacationStatusIndicator = ({ status }: StatusIndicatorProps) => {
  const theme = useTheme();
  const colors = getBadgeColor(status, theme);

  return (
    <Tooltip title="status" placement="top">
      <Box
        sx={{
          width: 8,
          height: 8,
          backgroundColor: colors?.indicatorColor,
          borderRadius: "50%",
          animation: status === "PENDING" ? "pulse 2s infinite" : "none",
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
