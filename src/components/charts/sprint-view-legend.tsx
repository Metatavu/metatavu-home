import { Box, Typography, useTheme } from "@mui/material";
import strings from "src/localization/strings";
import type { CardVisibilityProps } from "../generics/homepageCard";

/**
 * Renders legend for sprint view bar chart

 * @param props.hidden - Boolean indicating if card is hidden
 * @returns Legend for sprint view bar chart
 */
const SprintViewLegend = ({ hidden }: CardVisibilityProps) => {
  const theme = useTheme();

  const colors = hidden
    ? {
        primary: theme.palette.chart.disabledPrimary,
        secondary: theme.palette.chart.disabledSecondary,
        target: theme.palette.chart.disabledAccent
      }
    : {
        primary: theme.palette.chart.primary,
        secondary: theme.palette.chart.secondary,
        target: theme.palette.chart.accent
      };

  const legends = [
    {
      width: 3,
      color: colors.target,
      radius: theme.radius.xs,
      label: strings.sprint.targetHours
    },
    {
      width: 10,
      color: colors.secondary,
      radius: theme.radius.full,
      label: strings.sprint.actualWorkHours
    },
    {
      width: 10,
      color: colors.primary,
      radius: theme.radius.full,
      label: strings.sprint.estimateHours
    }
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap"
      }}
    >
      {legends.map((legend) => (
        <Box
          key={legend.label}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              width: legend.width,
              height: 10,
              borderRadius: legend.radius,
              backgroundColor: legend.color,
              mr: 0.5
            }}
          />
          <Typography variant="caption">= {legend.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default SprintViewLegend;
