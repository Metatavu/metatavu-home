import { FormControl, MenuItem, Select, type SelectChangeEvent, useTheme } from "@mui/material";

interface DropdownProps {
  displayOption: string;
  handleDisplayOptionChange: (event: SelectChangeEvent<string>) => void;
  displayOptions: { value: string; label: string }[];
}

const Dropdown = ({ displayOption, handleDisplayOptionChange, displayOptions }: DropdownProps) => {
  const theme = useTheme();

  return (
    <FormControl
      sx={{
        width: {
          md: "17%",
          sm: "40%",
          xs: "35%"
        }
      }}
      size="medium"
    >
      <Select
        value={displayOption}
        onChange={handleDisplayOptionChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        sx={{
          backgroundColor: theme.palette.primary.main,
          boxShadow: 2,
          textAlign: "center",
          color: theme.palette.primary.contrastText,
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
              backgroundColor: theme.palette.primary.main
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
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.action.hover
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
