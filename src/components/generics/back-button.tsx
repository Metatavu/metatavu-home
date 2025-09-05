import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import { KeyboardReturn } from "@mui/icons-material";
import strings from "src/localization/strings";
import { useModuleKey } from "src/hooks/useModuleKey";
import { urlToStringsKeyMap } from "./url-to-strings-mapper";

export default function BackButton() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const moduleKey = useModuleKey(urlToStringsKeyMap);
  const label = strings[moduleKey].back;

  const handleClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigate(-1);
    setTimeout(() => setIsNavigating(false), 500);
  };

  return (
    <Button
      variant="contained"
      sx={{ padding: "10px", width: "100%" }}
      onClick={handleClick}
      disabled={isNavigating}
    >
      <KeyboardReturn sx={{ marginRight: "10px" }} />
      <Typography>{label}</Typography>
    </Button>
  );
}
