import {
  Autocomplete,
  Box,
  Checkbox,
  Popper,
  type PopperProps,
  type SxProps,
  styled,
  TextField,
  type Theme
} from "@mui/material";
import type { KeyboardEvent, SyntheticEvent } from "react";
import strings from "src/localization/strings";

/**
 * Props for the TagsAutocomplete component
 *
 * @param tags Array of available tag options to display in the autocomplete dropdown.
 * @param tag Current text input value for the autocomplete.
 * @param selectedTags Array of currently selected tag strings.
 * @param handleTagChange Callback fired when the input text changes. Receives the new input value.
 * @param handleSelectedTagChange Callback fired when selected tags change. Receives array of selected tag strings.
 * @param handleEnter Callback fired when the Enter key is pressed in the input field. Receives the keyboard event.
 * @param styles Optional MUI sx styles to extend or override default styles.
 * @param size Optional size for the TextField component, either "small" or "medium". Defaults to "medium".
 */
interface TagsAutocompleteProps {
  tags: string[];
  tag: string;
  selectedTags: string[];
  handleTagChange: (event: SyntheticEvent, value: string) => void;
  handleSelectedTagChange: (event: SyntheticEvent, value: string[]) => void;
  handleEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  styles?: SxProps<Theme>;
  size?: "small" | "medium";
}

const CustomPopper = styled((props: PopperProps) => <Popper {...props} placement="bottom" />)({
  "& .MuiAutocomplete-paper": {
    marginTop: "10px"
  }
});

/**
 * TagsAutocomplete component for selecting multiple tags with autocomplete functionality
 *
 * @param props - TagsAutocompleteProps configuration object
 * @returns JSX.Element containing the Autocomplete component for tags selection
 */
const TagsAutocomplete = ({
  tags,
  tag,
  selectedTags,
  handleTagChange,
  handleSelectedTagChange,
  handleEnter,
  styles,
  size = "medium"
}: TagsAutocompleteProps) => {
  return (
    <Autocomplete
      multiple
      disableClearable
      freeSolo
      PopperComponent={CustomPopper}
      options={tags}
      sx={{ width: "100%" }}
      inputValue={tag}
      value={selectedTags}
      onInputChange={handleTagChange}
      onChange={handleSelectedTagChange}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={{
            width: "100%",
            ...styles
          }}
          size={size}
          onKeyDown={handleEnter}
          label={strings.softwareRegistry.tags}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          style={{ display: "flex", alignItems: "center" }}
          key={`tags-option-${option}`}
        >
          <Checkbox sx={{ marginRight: 2 }} checked={selected} />
          <Box
            minWidth="5px"
            sx={{
              marginRight: "10px",
              height: 40,
              borderRadius: "5px"
            }}
          />
          {option}
        </li>
      )}
    />
  );
};

export default TagsAutocomplete;
