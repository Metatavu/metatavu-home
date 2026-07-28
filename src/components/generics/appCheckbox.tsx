import { Checkbox, FormControlLabel, FormGroup, useTheme } from "@mui/material";

interface CheckboxProps {
  checked: boolean;
  label: string;
  disabled: boolean;
  onChange: () => void;
  ariaLabel: string;
}

/**
 * Re-usable component for checkbox.
 *
 * @param props.checked - Boolean indicating is the checkbox checked
 * @param props.label - String label of the checkbox
 * @param props.disabled - Boolean indicating if the box is disabled or not
 * @param props.onChange - Functionality to tick on/off the boxes
 * @param props.ariaLabel - Textual context for accessibility
 *
 * @returns Checkbox with a label, styled to match the theme.
 */
const AppCheckbox = ({ checked, label, disabled, onChange, ariaLabel }: CheckboxProps) => {
  const theme = useTheme();
  console.log(label);
  return (
    <FormGroup>
      <FormControlLabel
        label={label}
        control={
          <Checkbox
            disableRipple
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            slotProps={{ input: { "aria-label": ariaLabel } }}
            sx={{
              color: theme.palette.border.strong,
              "&:hover": {
                bgcolor: "transparent",

                ".MuiSvgIcon-root": {
                  backgroundColor: theme.palette.background.accentSecondary,
                  borderRadius: theme.radius.xs
                }
              },
              "&.Mui-checked": {
                color: theme.palette.background.accent
              }
            }}
          />
        }
      />
    </FormGroup>
  );
};

export default AppCheckbox;
