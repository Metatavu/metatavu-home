import { FormControl, Select, MenuItem, Tooltip } from "@mui/material";
import { useAtom } from "jotai";
import { languageAtom } from "src/atoms/language";
import strings from "src/localization/strings";
import type { Language } from "src/types";

const LocalizationButton = () => {
  const [language, setLanguage] = useAtom(languageAtom);

  return (
   // <Tooltip title={strings.header.changeLanguage}>
      <FormControl size="small">
        <Select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as Language)
          }
          variant="outlined"
          sx={{
            borderRadius: 2,
            minWidth: 80
          }}
        >
          <MenuItem value="fi">
            {strings.localization.fi}
          </MenuItem>

          <MenuItem value="en-gb">
            {strings.localization.en}
          </MenuItem>
        </Select>
      </FormControl>
    //</Tooltip>
  );
};

export default LocalizationButton;