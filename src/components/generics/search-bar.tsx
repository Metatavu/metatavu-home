import type { Theme } from "@emotion/react";
import { Search } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Card,
  Chip,
  Popper,
  type PopperProps,
  type SxProps,
  styled,
  TextField,
  useTheme
} from "@mui/material";
import strings from "src/localization/strings";

const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)(
  ({ theme }) => ({
    "& .MuiAutocomplete-noOptions": {
      display: "none"
    },
    "& .MuiAutocomplete-paper": {
      marginTop: "10px",
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary
    }
  })
);

/**
 * Props for the SearchBar component.
 *
 * @param searchInput Current text input value.
 * @param handleSearchInputChange Callback fired when the input text changes. Receives the new input value.
 * @param tags Array of available tag options to display in the autocomplete dropdown.
 * @param handleSelectedTagChange Callback fired when selected tags change. Receives array of selected tag strings.
 * @param autoCompleteId Optional HTML id attribute for the Autocomplete element.
 */
interface SearchBarProps {
  handleSearchInputChange?: (event: React.SyntheticEvent, value: string) => void;
  searchInput?: string;
  tags?: string[];
  handleSelectedTagChange?: (values: string) => void;
  autoCompleteId?: string;
  styles?: SxProps<Theme>;
  placeholder?: string;
  selectedTags?: string[];
}

/**
 * Generic search bar component with autocomplete and tag selection.
 *
 * Renders a card-based search interface with MUI Autocomplete, supporting both input text search
 * and multiple tag selection via checkboxes.
 *
 * @param props - SearchBarProps configuration object
 * @returns JSX.Element containing the search bar Card
 */
const SearchBar = ({
  searchInput,
  handleSearchInputChange,
  tags,
  handleSelectedTagChange,
  autoCompleteId,
  styles,
  placeholder,
  selectedTags
}: SearchBarProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* biome-ignore lint/correctness/useUniqueElementIds: keeping static id */}
      <Card
        id="wiki-article-search-bar"
        sx={{
          width: {
            lg: "100%",
            md: "calc(100% - 80px)",
            xs: "calc(100% - 80px)"
          },
          borderRadius: theme.radius.s,
          borderWidth: theme.borders.s,
          borderStyle: "solid",
          borderColor: theme.palette.border.primary,
          boxShadow: "none",
          marginBottom: { xs: 2 },
          ...styles
        }}
      >
        <Autocomplete
          slots={{
            popper: CustomPopper
          }}
          multiple
          disableCloseOnSelect
          id={autoCompleteId}
          options={tags || []}
          sx={{ width: "100%" }}
          clearOnBlur={false}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={(_event, _values, reason, details) => {
            if ((reason === "selectOption" || reason === "removeOption") && details?.option) {
              handleSelectedTagChange?.(details.option);
            }
          }}
          filterOptions={(options, { inputValue }) => {
            if (!inputValue.trim()) {
              return [];
            }
            return options.filter((option) =>
              option.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          size="small"
          renderValue={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder || strings.placeHolder.search}
              sx={{
                "& fieldset": {
                  border: "none",
                  marginBottom: "20px"
                }
              }}
              slotProps={{
                ...params.slotProps,

                input: {
                  ...params.slotProps.input,
                  endAdornment: null,
                  startAdornment: (
                    <>
                      <Search />
                      {params.slotProps.input.startAdornment}
                    </>
                  )
                }
              }}
            />
          )}
        />
      </Card>
      {selectedTags && selectedTags.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            px: 1,
            pb: 1
          }}
        >
          {selectedTags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => handleSelectedTagChange?.(tag)} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
