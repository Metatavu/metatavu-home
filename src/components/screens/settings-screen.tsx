import React, { useState } from "react";
import { Typography, Box, Switch, Button } from "@mui/material";
import strings from "src/localization/strings";

/**
 *
 * settings screen
 *
 */
const SettingsScreen = ({ onSave }: { onSave: (isAccepted: boolean) => void }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleToggleChange = () => {
    setIsAccepted((prevState) => !prevState);
  };

  const handleButtonClick = () => {
    console.log("settings not saved):", { isAccepted });
    onSave(isAccepted);
  };

  return (
    <Box p={2} bgcolor="grey.100" borderRadius={2}>
      <Typography variant="h5" gutterBottom>
        {strings.settingsScreen.consentToDataProcessing}
      </Typography>
      <Box display="flex" alignItems="center" mt={2}>
        <Typography variant="body1" sx={{ marginRight: 2 }}>
          {strings.settingsScreen.decline}
        </Typography>
        <Switch
          checked={isAccepted}
          onChange={handleToggleChange}
          inputProps={{ "aria-label": "information " }}
        />
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
          {strings.settingsScreen.accept}
        </Typography>
      </Box>
      <Box mt={2}>
        <Button variant="contained" onClick={handleButtonClick}>
          {strings.settingsScreen.saveSettings}
        </Button>
      </Box>
    </Box>
  );
};
export default SettingsScreen;
