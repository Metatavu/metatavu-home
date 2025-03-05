import React, { useState } from "react";
import { Typography, Box, Switch, Button } from "@mui/material";
import strings from "src/localization/strings";

/**
 * settings screen
 */
const SettingsScreen = ({ onSave, initialConsent }: { onSave: (isAccepted: boolean) => void, initialConsent: boolean }) => {
  const [isAccepted, setIsAccepted] = useState(initialConsent);

  const handleToggleChange = () => {
    setIsAccepted((prevState) => !prevState);
  };

  const handleButtonClick = () => {
    console.log("settings saved:", { isAccepted });
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
          inputProps={{ "aria-label": "information" }}
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