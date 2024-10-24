import React, { 
  FunctionComponent, 
  useState, 
  useCallback, 
  useMemo 
} from "react";
import { TextField, IconButton, Typography, Box, Chip, Button, InputAdornment } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import strings from "src/localization/strings";

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  onTagSelection: (selectedTags: string[]) => void;
  filteredApplicationsCount: number;
  availableTags: string[];
  onSearch: (value: string) => void;
}

/**
 * Sidebar component for filtering and searching applications by tags and search terms.
 *
 * This component allows user to filter applications based on tags and perform searches.
 * It provides a responsive sidebar with a tag selection and search input field.
 *
 * @param SidebarProps The props for the Sidebar component.
 * @returns The rendered Sidebar component.
 */
const Sidebar: FunctionComponent<SidebarProps> = ({
  onTagSelection,
  filteredApplicationsCount,
  availableTags,
  onSearch,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  /**
   * Filters available tags based on the search input and selected tags.
   * Only tags that match the search term or are already selected are shown.
   */
  const filteredTags = useMemo(() => {
    return availableTags.filter(tag => {
      const matchesSearch = tag.toLowerCase().includes(searchValue.toLowerCase());
      const isSelected = selectedTags.includes(tag);
      return matchesSearch || isSelected;
    });
  }, [availableTags, searchValue, selectedTags]);

  /**
   * Toggles the visibility of the sidebar.
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  /**
   * Handles the selection and deselection of tags.
   * When a tag is clicked, it is added or removed from the selected tags.
   *
   * @param tag The selected tag.
   */
  const handleTagClick = useCallback((tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    onTagSelection(updatedTags);
  }, [selectedTags, onTagSelection]);

  /**
   * Updates the search value and triggers the search callback when the search input changes.
   *
   * @param event The change event from the search input.
   */
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchValue(value);
    onSearch(value);
  }, [onSearch]);

  /**
   * Clears the search input and resets the tag selection.
   */
  const handleClearSearch = useCallback(() => {
    const emptySearch = "";
    setSearchValue(emptySearch);
    onSearch(emptySearch);
    setSelectedTags([]);
    onTagSelection([]);
  }, [onSearch, onTagSelection]);

  return (
    <>
      {!isSidebarOpen && (
        <IconButton onClick={toggleSidebar}>
          <SortIcon />
        </IconButton>
      )}
      {isSidebarOpen && (
        <Box
          sx={{
            width: 260,
            padding: 2,
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 0.5,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{strings.softwareRegistry.filter}</Typography>
            <IconButton onClick={toggleSidebar}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="primary" gutterBottom>
            {filteredApplicationsCount} {strings.softwareRegistry.results}
          </Typography>
          <TextField
            placeholder={strings.softwareRegistry.searchBy}
            variant="outlined"
            value={searchValue}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "#747474" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& fieldset": { borderColor: "#121212" },
              "& .MuiInputBase-root": {
                height: "40px",
                backgroundColor: "#fff",
                borderRadius: "7px",
              },
              "& .MuiInputBase-input": { color: "#747474" },
              mb: 2,
            }}
          />
          <Typography variant="body2" gutterBottom>
            {strings.softwareRegistry.tags}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {filteredTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                onDelete={selectedTags.includes(tag) ? () => handleTagClick(tag) : undefined}
                sx={{
                  borderRadius: "4px",
                  backgroundColor: selectedTags.includes(tag) ? "#f9473b" : "#fff",
                  color: selectedTags.includes(tag) ? "#fff" : "#000",
                  border: `1px solid ${selectedTags.includes(tag) ? "transparent" : "#f9473b"}`,
                  "& .MuiChip-deleteIcon": {
                    color: selectedTags.includes(tag) ? "#fff" : "#f9473b",
                  },
                  "&:hover": {
                    backgroundColor: selectedTags.includes(tag) ? "#000" : "#f9473b",
                    color: "#fff",
                    "& .MuiChip-deleteIcon": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
          </Box>
          <Button onClick={handleClearSearch} variant="text" color="primary" fullWidth>
            {strings.softwareRegistry.clearSearch}
          </Button>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
