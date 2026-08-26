import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import strings from "../../../localization/strings";

/** Props for the user search bar component */
interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search bar to filter users by name or email.
 * @param value - Current input value.
 * @param onChange - Callback to update input value.
 * @returns React element for the search input field.
 */
const UserSearchBar = ({ value, onChange }: UserSearchBarProps) => {
  return (
    <TextField
      size="small"
      placeholder={strings.userSearch.placeholder}
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
      sx={{ float: "inline-end", mb: 2, width: 300 }}
    />
  );
};

export default UserSearchBar;
