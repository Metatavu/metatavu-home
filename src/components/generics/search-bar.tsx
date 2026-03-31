import type { Theme } from "@emotion/react";
import { Search } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Card,
  Checkbox,
  IconButton,
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
  searchInput: string;
  handleSearchInputChange: (event: React.SyntheticEvent, value: string) => void;
  tags: string[];
  handleSelectedTagChange: (values: string[]) => void;
  autoCompleteId?: string;
  styles?: SxProps<Theme>;
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
const SearchBar = (props: SearchBarProps): JSX.Element => {
  const {
    searchInput,
    handleSearchInputChange,
    tags,
    handleSelectedTagChange,
    autoCompleteId,
    styles
  } = props;
  const theme = useTheme();

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: keeping static id
    <Card
      id="wiki-article-search-bar"
      sx={{
        width: {
          lg: "73%",
          md: "calc(100% - 80px)",
          xs: "calc(100% - 80px)"
        },
        boxShadow: 2,
        marginBottom: { xs: 2 },
        ...styles
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Autocomplete
          PopperComponent={CustomPopper}
          multiple
          disableCloseOnSelect
          id={autoCompleteId}
          options={tags}
          sx={{ width: "100%" }}
          clearOnBlur={false}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={(_event, values) => {
            handleSelectedTagChange(values);
          }}
          size="small"
          renderOption={(props, option, { selected }) => (
            <li
              {...props}
              style={{ display: "flex", alignItems: "center" }}
              key={`tags-option-${option}`}
            >
              <Checkbox
                sx={{
                  color: theme.palette.text.primary,
                  marginRight: 2
                }}
                checked={selected}
              />
              <Box
                minWidth="5px"
                style={{ marginRight: "10px" }}
                component="span"
                sx={{
                  height: 40,
                  borderRadius: "5px"
                }}
              />
              {option}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={strings.wikiDocumentation.searchArticle}
              sx={{
                "& fieldset": {
                  border: "none",
                  marginBottom: "20px"
                }
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: null,
                startAdornment: (
                  <>
                    <IconButton>
                      <Search />
                    </IconButton>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          ListboxProps={{
            sx: {
              display: "grid",
              columnGap: 3,
              rowGap: 1,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)"
              }
            }
          }}
        />
      </Box>
    </Card>
  );
};

export default SearchBar;
