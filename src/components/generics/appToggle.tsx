import { CheckCircleRounded } from "@mui/icons-material";
import { Switch, type SxProps, type Theme } from "@mui/material";

interface ToggleProps {
  checked: boolean;
  onChange: (e: any) => void;
  ariaLabel: string;
  disabled: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Component for the app toggle
 *
 * @param props.checked - Boolean indicating if the toggle is on
 * @param props.onChange - Functionality to switch toggle on/off
 * @param props.ariaLabel - String label for accessibility purposes
 * @param props.disabled - Boolean indicating if the toggle is disabled
 * @param props.sx - Additional styles for the toggle
 *
 * @returns A styled Switch toggle component
 */
const AppToggle = ({ checked, onChange, ariaLabel, disabled, sx }: ToggleProps) => {
  return (
    <Switch
      sx={sx}
      checkedIcon={
        <CheckCircleRounded
          sx={{
            width: 22,
            height: 22,
            gap: 0,
            transform: "scale(1.2)"
          }}
        />
      }
      checked={checked}
      onChange={onChange}
      slotProps={{ input: { "aria-label": ariaLabel } }}
      disabled={disabled}
    />
  );
};

export default AppToggle;
