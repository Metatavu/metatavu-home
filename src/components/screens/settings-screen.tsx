import { useState } from "react";
import { Typography, Box, Switch } from "@mui/material";
import strings from "src/localization/strings";
import { errorAtom } from "src/atoms/error";
import { useAtomValue, useSetAtom } from "jotai";
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { useLambdasApi } from "src/hooks/use-api";

/**
 * Settings screen component
 */
const SettingsScreen = () => {
  const { usersApi } = useLambdasApi();
  
  const auth = useAtomValue(authAtom);
  const userProfile = useAtomValue(userProfileAtom);
  
  console.log("auth is", auth);
  console.log("user profile is", userProfile);
  // TODO: get email and keycloak Id from the token
  
  // TODO: Consent is given should come from the user keycloak token- if it contains severaUserId then consent is true
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const setError = useSetAtom(errorAtom);

  const handleToggleChange = () => {
    grantSeveraOptInConsent();
  };

  const grantSeveraOptInConsent = async () => {
      try {
        const consent = await usersApi.updateUserAttribute({
          id: userId,
          attributeName: "severaUserId",
          updateUserAttributeRequest: {email: email}
        });
        // TODO: Use the response to update the state
        // setIsConsentGiven();
      } catch (error) {
        console.error("Error fetching consent:", error);
        // TODO: Error messages in the UI should be localized
        setError("Error fetching consent");
      }
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
          checked={isConsentGiven}
          onChange={handleToggleChange}
          inputProps={{ "aria-label": "information" }}
          disabled={isConsentGiven}
        />
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
          {strings.settingsScreen.accept}
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsScreen;