import { Box, CircularProgress, Switch, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { type ThemeMode, ThemeModes } from "src/types/index";

type SettingsScreenProps = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

/**
 * Settings screen component
 */
const SettingsScreen = ({ mode, setMode }: SettingsScreenProps) => {
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
      if (!userProfile?.email || !userProfile?.id) {
        setError(strings.error.missingEmailOrId);
        return;
      }

      const response = await usersApi.updateUserAttribute({
        updateUserAttributeRequest: { email: userProfile.email },
        id: userProfile.id,
        attributeName: "isSeveraOptIn"
      });

      const severaUserIdRaw = response?.updatedKeycloakAttributes?.severaUserId;
      const severaUserId = Array.isArray(severaUserIdRaw) ? severaUserIdRaw[0] : severaUserIdRaw;

      setIsConsentGiven(Boolean(severaUserId));
      if (severaUserId) {
        const updatedAttributes = {
          ...(userProfile.attributes ?? {}),
          severaUserId
        } as Record<string, string[] | string | undefined>;

        const updatedProfile = { ...userProfile, attributes: updatedAttributes };
        setUserProfile(updatedProfile);
        setUsers((prev) =>
          prev.map((u) => (u.id === userProfile.id ? { ...u, attributes: updatedAttributes } : u))
        );
      }
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
        setError(strings.error.missingEmailOrId);
        return;
      }

      await usersApi.removeSeveraOptIn({ userId: userProfile.id });
      const updatedAttributes = { ...(userProfile.attributes ?? {}) } as Record<
        string,
        string[] | string | undefined
      >;
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

  const handleModeToggle = () => {
    const newMode: ThemeMode = mode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT;
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  return (
    <Box p={2}>
      <Box
        p={2}
        borderRadius={2}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.background.default,
          "&:hover": {
            bgcolor: (theme) => theme.palette.action.hover
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
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.background.default,
          "&:hover": {
            bgcolor: (theme) => theme.palette.action.hover
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
              checked={mode === ThemeModes.DARK}
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
