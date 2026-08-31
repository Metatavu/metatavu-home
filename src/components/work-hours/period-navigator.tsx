import { ArrowBackIosNewRounded, ArrowForwardIosRounded } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { InputRow } from "../generics/appNumberInput";

interface PeriodNavigatorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  previousDisabled?: boolean;
}

/**
 * Rounded pill navigator shown below the balance chart, used to
 * step the visible week/month/year backward or forward.
 *
 * @param props.label - Text shown between the arrows (e.g. "Week 6 (2026)")
 * @param props.onPrevious - Called when the back arrow is pressed
 * @param props.onNext - Called when the forward arrow is pressed
 * @param props.nextDisabled - Disables the forward arrow (e.g. can't go past today)
 * @param props.previousDisabled - Optionally disables the back arrow
 */
const PeriodNavigator = ({
  label,
  onPrevious,
  onNext,
  nextDisabled,
  previousDisabled
}: PeriodNavigatorProps) => {
  const theme = useTheme();

  return (
    <InputRow>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: theme.spaces.m,
          border: `${theme.borders.s} solid`,
          borderColor: theme.palette.border.subtle,
          borderRadius: theme.radius.s,
          paddingInline: theme.spaces.m,
          paddingBlock: theme.spaces.xs
        }}
      >
        <IconButton size="small" onClick={onPrevious} disabled={previousDisabled}>
          <ArrowBackIosNewRounded fontSize="small" />
        </IconButton>

        <Typography variant="body" sx={{ minWidth: 140, textAlign: "center" }}>
          {label}
        </Typography>

        <IconButton size="small" onClick={onNext} disabled={nextDisabled}>
          <ArrowForwardIosRounded fontSize="small" />
        </IconButton>
      </Box>
    </InputRow>
  );
};

export default PeriodNavigator;
