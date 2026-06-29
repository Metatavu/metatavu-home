import { KeyboardArrowDown } from "@mui/icons-material";
import { MenuItem, Select, type SelectChangeEvent, useTheme } from "@mui/material";

/**
 * Dropdown properties
 *
 * @param props.displayOption  The currently selected display option
 * @param props.handleDisplayOptionChange  Event handler for when the display option changes
 * @param props.displayOptions  Array of available display options with value and label
 */

interface DropdownProps {
  displayOption: string;
  handleDisplayOptionChange: (event: SelectChangeEvent<string>) => void;
  displayOptions: { value: string; label: string }[];
}

/**
 * Dropdown component for selecting display options
 *
 * @param props.displayOption - The currently selected display option
 * @param props.handleDisplayOptionChange - Event handler for when the display option changes
 * @param props.displayOptions - Array of available display options with value and label
 */
const Dropdown = ({ displayOption, handleDisplayOptionChange, displayOptions }: DropdownProps) => {
  const theme = useTheme();

  return (
    <Select
      variant="outlined"
      IconComponent={KeyboardArrowDown}
      value={displayOption}
      onChange={handleDisplayOptionChange}
      displayEmpty
      inputProps={{ "aria-label": "Without label" }}
      sx={{
        color: theme.palette.text.primary,
        minWidth: 78,
        maxWidth: 200,
        maxHeight: 40,
        paddingRight: theme.spaces.m,
        typography: "bodySmall",
        textTransform: "capitalize",
        borderRadius: theme.radius.s,
        borderWidth: theme.borders.s,
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.border.strong,
          borderWidth: theme.borders.s
        },
        "& .MuiSelect-icon": {
          color: theme.palette.icons.primary,
          minHeight: 24,
          minWidth: 24
        }
      }}
      MenuProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "right"
        },
        PaperProps: {
          variant: "outlined",
          elevation: 0,
          sx: {
            marginTop: theme.spaces.xs
          }
        }
      }}
    >
      {displayOptions.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{
            typography: "bodySmall",
            textTransform: "capitalize",
            "&.Mui-selected": {
              backgroundColor: theme.palette.background.selected,
              color: theme.palette.text.accent
            },

            "&.Mui-selected:hover": {
              backgroundColor: theme.palette.background.selected
            },

            "&.Mui-selected.Mui-focusVisible": {
              backgroundColor: theme.palette.background.selected
            }
          }}
        >
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default Dropdown;
