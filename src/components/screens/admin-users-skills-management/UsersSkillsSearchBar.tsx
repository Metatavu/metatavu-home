import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import strings from "../../../localization/strings";

/** Props for the user search bar component */
interface UsersSkillsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search bar to filter users by name or email.
 * @param value - Current input value.
 * @param onChange - Callback to update input value.
 * @returns React element for the search input field.
 */
const UsersSkillsSearchBar = ({ value, onChange }: UsersSkillsSearchBarProps) => {
  return (
    <TextField
      fullWidth
      placeholder={strings.usersSkillsSearchBar.placeholder}
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
    />
  );
};

export default UsersSkillsSearchBar;
