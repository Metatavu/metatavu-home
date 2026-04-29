import { Box, Typography, useTheme } from "@mui/material";
import strings from "src/localization/strings";

/**
 * Displays legend for the sprint view chart.
 */
const SprintViewLegend = () => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" mt={1.5} gap={1}>
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
