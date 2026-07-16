import type { SelectChangeEvent } from "@mui/material";
import { useAtom } from "jotai";
import { languageAtom } from "src/atoms/language";
import strings from "src/localization/strings";
import type { Language } from "src/types";
import Dropdown from "../generics/dropdown";

const LocalizationButton = () => {
  const [language, setLanguage] = useAtom(languageAtom);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as Language);
  };

  const options = [
    { value: "en-gb", label: strings.localization.english },
    { value: "fi", label: strings.localization.finnish }
  ];

  return (
    <Dropdown
      displayOption={language}
      handleDisplayOptionChange={handleChange}
      displayOptions={options}
    />
  );
};

export default LocalizationButton;