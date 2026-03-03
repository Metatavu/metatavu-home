import { Box, Typography, useTheme } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Displays legend for the sprint view chart.
 * Shows Estimated and Actual hours on separate lines.
 */
const SprintViewLegend = () => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" mt={1.5} gap={1}>
      {/* Estimated Hours */}
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: theme.palette.info.main,
            mr: 1
          }}
        />
        <Typography variant="caption" sx={{ fontSize: 12 }}>
          {strings.sprint.estimateHours}
        </Typography>
      </Box>

      {/* Actual Hours */}
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: theme.palette.success.main,
            mr: 1
          }}
        />
        <Typography variant="caption" sx={{ fontSize: 12 }}>
          {strings.sprint.actualWorkHours}
        </Typography>
      </Box>
    </Box>
  );
};

export default SprintViewLegend;
