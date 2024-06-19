import { Search } from "@mui/icons-material";
import { Box, TextField, InputAdornment } from "@mui/material";
import type { ChangeEvent } from "react";

/**
 *  Search component properties
 */
interface Props {
  loading: boolean;
  searchInput: string;
  placeholder: string;
  handleSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Renders the search
 */
export const renderSearch = ({
  loading,
  searchInput,
  handleSearchInputChange,
  placeholder
}: Props) => (
  <Box sx={{ display: "flex", justifyContent: "center" }}>
    <TextField
      value={searchInput}
      onChange={handleSearchInputChange}
      placeholder={placeholder}
      variant="standard"
      disabled={loading}
      sx={{ width: "99%", padding: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        )
      }}
    />
  </Box>
);
