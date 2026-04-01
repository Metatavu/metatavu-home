import { FormControl, MenuItem, Select, type SelectChangeEvent, useTheme } from "@mui/material";

interface DropdownProps {
  displayOption: string;
  handleDisplayOptionChange: (event: SelectChangeEvent<string>) => void;
  displayOptions: { value: string; label: string }[];
}
/**
 * Dropdown component for selecting display options
 * @param props.displayOption - The currently selected display option
 * @param props.handleDisplayOptionChange - Event handler for when the display option changes
 * @param props.displayOptions - Array of available display options with value and label
 */
const Dropdown = ({ displayOption, handleDisplayOptionChange, displayOptions }: DropdownProps) => {
  const theme = useTheme();

  return (
    <FormControl
      sx={{
        width: {
          md: "17%",
          sm: "40%",
          xs: "35%"
        },
        color: theme.palette.text.primary,
        "& fieldset": { border: "none" }
      }}
      size="medium"
    >
      <Select
        value={displayOption}
        onChange={handleDisplayOptionChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: 2,
          textAlign: "center",
          color: theme.palette.text.primary,
          fontWeight: "bold",
          textTransform: "uppercase",
          "&:hover": {
            backgroundColor: theme.palette.action.hover
          },
          "& fieldset": { border: "none" }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              marginTop: "10px",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              backgroundColor: theme.palette.background.paper
            }
          }
        }}
      >
        {displayOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              textTransform: "uppercase",
              paddingLeft: 3,
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
              "&:hover": {
                backgroundColor: theme.palette.action.hover
              },
              "&.Mui-selected": {
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover
                }
              }
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
