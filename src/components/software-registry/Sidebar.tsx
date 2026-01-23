import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
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
const Sidebar = ({
  onTagSelection,
  filteredApplicationsCount,
  availableTags,
  onSearch
}: SidebarProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const theme = useTheme();

  /**
   * Filters available tags based on the search input and selected tags.
   * Only tags that match the search term or are already selected are shown.
   */
  const filteredTags = useMemo(() => {
    return availableTags.filter((tag) => {
      const matchesSearch = tag.toLowerCase().includes(searchValue.toLowerCase());
      const isSelected = selectedTags.includes(tag);
      return matchesSearch || isSelected;
    });
  }, [availableTags, searchValue, selectedTags]);

  /**
   * Toggles the visibility of the sidebar.
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Handles the selection and deselection of tags.
   * When a tag is clicked, it is added or removed from the selected tags.
   *
   * @param tag The selected tag.
   */
  const handleTagClick = useCallback(
    (tag: string) => {
      const updatedTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onTagSelection(updatedTags);
    },
    [selectedTags, onTagSelection]
  );

  /**
   * Updates the search value and triggers the search callback when the search input changes.
   *
   * @param event The change event from the search input.
   */
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchValue(value);
      onSearch(value);
    },
    [onSearch]
  );

  /**
   * Clears the search input and resets the tag selection.
   */
  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    onSearch("");
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
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            height: "100%",
            borderRadius: 0.5,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)"
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2">{strings.softwareRegistry.filter}</Typography>
            <IconButton onClick={toggleSidebar}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ color: theme.palette.info.main }} gutterBottom>
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
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              )
            }}
            sx={{
              "& fieldset": { borderColor: theme.palette.divider },
              "& .MuiInputBase-root": {
                height: "40px",
                backgroundColor: theme.palette.background.default,
                borderRadius: "7px",
                color: theme.palette.text.primary
              },
              "& .MuiInputBase-input": { color: theme.palette.text.primary },
              mb: 2
            }}
          />
          <Typography variant="subtitle2" gutterBottom>
            {strings.softwareRegistry.tags}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  onDelete={isSelected ? () => handleTagClick(tag) : undefined}
                  sx={{
                    borderRadius: "4px",
                    backgroundColor: isSelected
                      ? theme.palette.secondary.main
                      : theme.palette.background.paper,
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    border: `1px solid ${isSelected ? "transparent" : theme.palette.primary.main}`,
                    "& .MuiChip-deleteIcon": {
                      color: isSelected
                        ? theme.palette.primary.contrastText
                        : theme.palette.primary.main
                    },
                    "&:hover": {
                      backgroundColor: isSelected
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.primary.contrastText
                      }
                    }
                  }}
                />
              );
            })}
          </Box>
          <Button
            onClick={handleClearSearch}
            variant="text"
            color="primary"
            fullWidth
            sx={{ color: theme.palette.text.primary }}
          >
            {strings.softwareRegistry.clearSearch}
          </Button>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
