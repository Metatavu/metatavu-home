import { Box, CircularProgress, Switch, Typography, useTheme } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { type ThemeMode, ThemeModes } from "src/types/index";

type SettingsScreenProps = {
  screenColorMode: ThemeMode;
  setScreenColorMode: (screenColorMode: ThemeMode) => void;
};

/**
 * Settings screen component
 */
const SettingsScreen = ({ screenColorMode, setScreenColorMode }: SettingsScreenProps) => {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const { usersApi } = useLambdasApi();
  const setUsers = useSetAtom(usersAtom);
  const setError = useSetAtom(errorAtom);

  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(
    Boolean(userProfile?.attributes?.severaUserId)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsConsentGiven(Boolean(userProfile?.attributes?.severaUserId));
  }, [userProfile?.attributes?.severaUserId]);

  /**
   * Handles toggle change event
   */
  const handleToggleChange = () => {
    if (isConsentGiven) {
      revokeSeveraOptIn();
    } else {
      grantSeveraOptInConsent();
    }
  };

  /**
   * Grants severa opt-in consent
   */
  const grantSeveraOptInConsent = async () => {
    setLoading(true);
    try {
      if (!userProfile?.id) {
        setError(strings.error.missingUserId);
        return;
      }

      await usersApi.addSeveraOptIn({ userId: userProfile.id });
      const fetchedUser = await usersApi.findUser({ userId: userProfile.id });
      const severaUserId = fetchedUser?.attributes?.severaUserId?.[0];

      if (!severaUserId) {
        setError(strings.error.noSeveraUserId);
        return;
      }

      setIsConsentGiven(Boolean(severaUserId));
      const updatedAttributes = { ...userProfile.attributes, severaUserId };
      const updatedProfile = { ...userProfile, attributes: updatedAttributes };
      setUserProfile(updatedProfile);
      setUsers((prev) =>
        prev.map((u) => (u.id === userProfile.id ? { ...u, attributes: updatedAttributes } : u))
      );
      
    } catch (error) {
      setError(`${strings.error.fetchFailedSevera}, ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revokes severa opt-in consent
   */
  const revokeSeveraOptIn = async () => {
    setLoading(true);
    try {
      if (!userProfile?.id) {
        setError(strings.error.missingUserId);
        return;
      }

      await usersApi.removeSeveraOptIn({ userId: userProfile.id });
      const updatedAttributes = { ...userProfile.attributes };
      delete updatedAttributes.severaUserId;
      delete updatedAttributes.isSeveraOptIn;

      const updatedProfile = { ...userProfile, attributes: updatedAttributes };
      setUserProfile(updatedProfile);
      setUsers((prev) =>
        prev.map((u) => (u.id === userProfile.id ? { ...u, attributes: updatedAttributes } : u))
      );
      setIsConsentGiven(false);
    } catch (error) {
      setError(`${strings.error.fetchFailedSevera}, ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the screen color mode between light and dark. Updates the screenColorMode state and saves the new value in localStorage.
   */
  const handleModeToggle = () => {
    const newScreenColorMode: ThemeMode =
      screenColorMode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT;
    setScreenColorMode(newScreenColorMode);
    localStorage.setItem("screenColorMode", newScreenColorMode);
  };

  return (
    <Box p={2}>
      <Box
        p={2}
        borderRadius={2}
        sx={{
          bgcolor: theme.palette.background.paper,
          "&:hover": {
            bgcolor: theme.palette.action.hover
          },
          transition: "background-color 0.2s ease"
        }}
      >
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
              inputProps={{ "aria-label": "severa-opt-in" }}
              disabled={loading}
            />
            {loading && (
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
      <Box
        p={2}
        borderRadius={2}
        sx={{
          bgcolor: theme.palette.background.paper,
          "&:hover": {
            bgcolor: theme.palette.action.hover
          },
          transition: "background-color 0.2s ease"
        }}
      >
        <Typography variant="h5" gutterBottom>
          {strings.settingsScreen.lightOrDarkMode}
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            {strings.settingsScreen.light}
          </Typography>
          <Box display="flex" alignItems="center">
            <Switch
              checked={screenColorMode === ThemeModes.DARK}
              onChange={handleModeToggle}
              inputProps={{ "aria-label": "dark-mode-toggle" }}
            />
            {loading && (
              <Box ml={1}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            {strings.settingsScreen.dark}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsScreen;
