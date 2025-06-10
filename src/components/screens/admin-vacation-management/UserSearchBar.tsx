import type React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({ value, onChange }) => {
  return (
    <TextField
      fullWidth
      placeholder="Search users by name or email"
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

export default UserSearchBar;
