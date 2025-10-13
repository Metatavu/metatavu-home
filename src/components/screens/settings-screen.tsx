import { Box, CircularProgress, Switch, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

/**
 * Settings screen component
 */
const SettingsScreen = () => {
  const { usersApi } = useLambdasApi();
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const setUsers = useSetAtom(usersAtom);
  const setError = useSetAtom(errorAtom);

  const [isConsentGiven, setIsConsentGiven] = useState(
    Boolean(userProfile?.attributes?.severaUserId)
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleChange = () => {
    grantSeveraOptInConsent();
  };

  const grantSeveraOptInConsent = async () => {
    setIsLoading(true);
    try {
      if (!userProfile?.email || !userProfile?.id) {
        setError(strings.error.missingEmailOrId);
        return;
      }

      const response = await usersApi.updateUserAttribute({
        updateUserAttributeRequest: { email: userProfile?.email },
        id: userProfile?.id,
        attributeName: "isSeveraOptIn"
      });

      const severaUserId = response.updatedKeycloakAttributes
        ? response.updatedKeycloakAttributes.severaUserId
        : undefined;

      setIsConsentGiven(Boolean(severaUserId));

      if (severaUserId) {
        const updatedProfile = {
          ...userProfile,
          attributes: {
            ...userProfile.attributes,
            severaUserId
          }
        };

        setUserProfile(updatedProfile);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userProfile.id ? { ...u, attributes: { ...u.attributes, severaUserId } } : u
          )
        );
      }
    } catch (error) {
      console.error("Error fetching consent:", error);
      setError(`${strings.error.fetchFailedFlextime}, ${error}`);
    } finally {
      setIsLoading(false);
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
        <Box display="flex" alignItems="center">
          <Switch
            checked={isConsentGiven}
            onChange={handleToggleChange}
            inputProps={{ "aria-label": "information" }}
            disabled={isConsentGiven || isLoading}
          />
          {isLoading && (
            <Box ml={1}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Box>
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
          {strings.settingsScreen.accept}
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsScreen;
