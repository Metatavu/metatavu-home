import { ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  ariaLabel: string;
}

/**
 * Generic pill-style segmented control (e.g. Week / Month / Year).
 *
 * @param props.value - Currently selected value
 * @param props.onChange - Called with the newly selected value
 * @param props.options - Selectable options
 * @param props.ariaLabel - Accessible label for the control group
 */
const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: SegmentedControlProps<T>) => {
  const theme = useTheme();

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_event, newValue: T | null) => {
        if (newValue !== null) onChange(newValue);
      }}
      aria-label={ariaLabel}
      sx={{
        backgroundColor: theme.segmentedControl.default,
        borderRadius: theme.radius.s,
        padding: theme.spaces.xxs,
        gap: theme.spaces.xxs,
        "& .MuiToggleButtonGroup-grouped": {
          border: 0,
          borderRadius: `${theme.radius.xs} !important`,
          textTransform: "none",
          fontWeight: 600,
          color: theme.palette.text.primary,
          paddingInline: theme.spaces.m,
          "&.Mui-selected": {
            backgroundColor: theme.segmentedControl.selected,
            color: theme.palette.text.primary,
          },
          "&.Mui-selected:hover": {
            backgroundColor: theme.segmentedControl.selected,
          },
          "&:hover": {
            backgroundColor: theme.segmentedControl.hover,
          },
        },
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SegmentedControl;
