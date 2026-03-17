import { Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Switch, Typography, useTheme } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { snackbarAtom } from "src/atoms/snackbar";
import { usersAtom } from "src/atoms/user";
import { JobDescriptionRole } from "src/generated/homeLambdasClient";
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
  const setSnackbar = useSetAtom(snackbarAtom);

  const ALL_ROLES = Object.values(JobDescriptionRole);

  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(
    Boolean(userProfile?.attributes?.severaUserId)
  );
  const [loading, setLoading] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState<JobDescriptionRole[]>(
    (userProfile?.attributes?.jobDescriptions ?? []) as JobDescriptionRole[]
  );
  const [savingRoles, setSavingRoles] = useState(false);

  useEffect(() => {
    setIsConsentGiven(Boolean(userProfile?.attributes?.severaUserId));
  }, [userProfile?.attributes?.severaUserId]);

  useEffect(() => {
    setSelectedRoles((userProfile?.attributes?.jobDescriptions ?? []) as JobDescriptionRole[]);
  }, [userProfile?.attributes?.jobDescriptions]);

  /**
   * Handles role checkbox toggle
   */
  const handleRoleToggle = (role: JobDescriptionRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  /**
   * Saves the selected job description roles to Keycloak
   */
  const saveJobDescriptions = async () => {
    if (!userProfile?.id) {
      setError(strings.error.missingUserId);
      return;
    }
    setSavingRoles(true);
    try {
      await usersApi.updateUserJobDescriptions({
        userId: userProfile.id,
        updateUserJobDescriptionsRequest: { jobDescriptions: selectedRoles }
      });
      const updatedAttributes = { ...userProfile.attributes, jobDescriptions: selectedRoles };
      setUserProfile({ ...userProfile, attributes: updatedAttributes });
      setUsers((prev) =>
        prev.map((u) => (u.id === userProfile.id ? { ...u, attributes: updatedAttributes } : u))
      );
      setSnackbar({ open: true, message: strings.settingsScreen.jobDescriptionSaved, severity: "success" });
    } catch (error) {
      setError(`${strings.settingsScreen.jobDescriptionError} ${String(error)}`);
    } finally {
      setSavingRoles(false);
    }
  };

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

      setIsConsentGiven(Boolean(severaUserId));
      if (severaUserId) {
        const updatedAttributes = { ...userProfile.attributes, severaUserId };
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
      <Box
        mt={2}
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
          {strings.settingsScreen.jobDescriptionTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {strings.settingsScreen.jobDescriptionSubtitle}
        </Typography>
        <FormGroup row>
          {ALL_ROLES.map((role) => (
            <FormControlLabel
              key={role}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={savingRoles}
                />
              }
              label={strings.settingsScreen[`role${role.charAt(0) + role.slice(1).toLowerCase()}` as keyof typeof strings.settingsScreen] as string}
            />
          ))}
        </FormGroup>
        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            onClick={saveJobDescriptions}
            disabled={savingRoles}
          >
            {strings.settingsScreen.saveRoles}
          </Button>
          {savingRoles && <CircularProgress size={20} />}
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsScreen;
