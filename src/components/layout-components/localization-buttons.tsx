import { styled, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { useAtom } from "jotai";
import { languageAtom } from "src/atoms/language";
import strings from "src/localization/strings";
import type { Language } from "src/types";
/**
 * Styled toggle button group component for language switching
 */
export const LanguageButtons = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    margin: theme.spacing(1),
    border: 0,
    width: 48,
    height: 48,
    "&.Mui-disabled": {
      border: 0
    },
    "&:not(:first-of-type)": {
      borderRadius: "50%"
    },
    "&:first-of-type": {
      borderRadius: "50%"
    }
  }
}));

/**
 * LocalizationButton component
 */
const LocalizationButton = () => {
  const [language, setLanguage] = useAtom(languageAtom);

  /**
   * Handles localization change
   *
   * @param locale locale to change to
   */
  const handleLocaleChange = (locale: string) => {
    const newLocale: Language = locale === "en-gb" ? "fi" : "en-gb";
    setLanguage(newLocale as Language);
  };

  return (
    <LanguageButtons value={language} exclusive aria-label="localization">
      <Tooltip title={strings.header.changeLanguage}>
        <ToggleButton value={language} onChange={() => handleLocaleChange(language)}>
          {language === "fi" ? strings.localization.fi : strings.localization.en}
        </ToggleButton>
      </Tooltip>
    </LanguageButtons>
  );
};

export default LocalizationButton;
