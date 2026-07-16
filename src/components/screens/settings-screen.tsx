import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
  useTheme
} from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { Role } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { type ThemeMode, ThemeModes } from "src/types/index";

type SettingsScreenProps = {
  screenColorMode: ThemeMode;
  setScreenColorMode: (screenColorMode: ThemeMode) => void;
};

/**
 * Roles that users are allowed to select themselves
 * admin is intentionally not included because it is restricted role.
 */
const SELECTABLE_ROLES: Role[] = [
  Role.DEVELOPER,
  Role.DESIGNER,
  Role.ARCHITECT,
  Role.MANAGEMENT,
  Role.TRAINEE
];

/**
 * user friendly lables for generated role enum values.
 */
const ROLE_LABELS: Record<Role, string> = {
  [Role.DEVELOPER]: "Developer",
  [Role.DESIGNER]: "Designer",
  [Role.ARCHITECT]: "Architect",
  [Role.ADMIN]: "Admin",
  [Role.MANAGEMENT]: "Management",
  [Role.TRAINEE]: "Trainee"
};

/**
 * Settings screen component
 */
const SettingsScreen = ({ screenColorMode, setScreenColorMode }: SettingsScreenProps) => {
  const theme = useTheme();
  const { isDeveloper } = useUserRole();
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const { usersApi } = useLambdasApi();
  const setUsers = useSetAtom(usersAtom);
  const setError = useSetAtom(errorAtom);

  const [isConsentGiven, setIsConsentGiven] = useState<boolean>(
    Boolean(userProfile?.attributes?.severaUserId)
  );
  const [loading, setLoading] = useState(false);

  /**
   * currently selected self assignable roles.
   */
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  /**
   * Roles originally loaded from the backend
   */
  const [initialRoles, setInitialRoles] = useState<Role[]>([]);

  /**
   * loading state for Get /users/{userId/roles}
   */
  const [rolesLoading, setRolesLoading] = useState(false);

  /**
   * loading state for PUT /users/{userId}/roles
   */
  const [rolesSaving, setRolesSaving] = useState(false);

  /**
   * controls the sucess message shown after saving
   */
  const [rolesSavedSuccessfully, setRolesSavedSuccessfully] = useState(false);

  useEffect(() => {
    setIsConsentGiven(Boolean(userProfile?.attributes?.severaUserId));
  }, [userProfile?.attributes?.severaUserId]);

  /**
   * load the logged-in user's existing roles when the settings page opens.
   */
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!userProfile?.id) {
        return;
      }

      setRolesLoading(true);
      setRolesSavedSuccessfully(false);

      try {
        const response = await usersApi.getUserRoles({
          userId: userProfile.id
        });

        /**
         * Only keep roles that the user is allowed to edit.
         *
         * For example, Admin may be returned by Keycloak, but it should not
         * be shown as a self-selectable checkbox.
         */
        const editableRoles = (response.roles ?? []).filter((role) =>
          SELECTABLE_ROLES.includes(role)
        );

        setSelectedRoles(editableRoles);
        setInitialRoles(editableRoles);
      } catch (error: any) {
        try {
          const errorResponse = await error?.response?.json();

          setError(
            `Failed to load job descriptions: ${
              errorResponse?.message || error?.message || String(error)
            }`
          );
        } catch {
          setError("Failed to load job descriptions.");
        }
      } finally {
        setRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [userProfile?.id, usersApi, setError]);

  /**
   * Handles toggle change event
   */
  const handleToggleChange = () => {
    if (!isDeveloper) {
      return;
    }

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
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.fetchFailedSevera}: ${errorMessage?.message || error}`);
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
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.fetchFailedSevera}: ${errorMessage?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * adds or remove one role from theselected roles.
   */
  const handleRoleToggle = (role: Role) => {
    setRolesSavedSuccessfully(false);

    setSelectedRoles((currentRoles) => {
      const roleAlreadySelected = currentRoles.includes(role);

      if (roleAlreadySelected) {
        return currentRoles.filter((currentRole) => currentRole !== role);
      }

      return [...currentRoles, role];
    });
  };

  /**
   * Saves the selected self-assignable roles.
   */
  // NEW
  const handleSaveRoles = async () => {
    if (!userProfile?.id) {
      setError(strings.error.missingUserId);
      return;
    }

    setRolesSaving(true);
    setRolesSavedSuccessfully(false);

    try {
      await usersApi.updateUserRoles({
        userId: userProfile.id,
        updateUserRolesRequest: {
          roles: selectedRoles
        }
      });

      /**
       * Store a copy of the saved roles so that the Save button becomes
       * disabled again until another change is made.
       */
      setInitialRoles([...selectedRoles]);
      setRolesSavedSuccessfully(true);
    } catch (error: any) {
      try {
        const errorResponse = await error?.response?.json();

        setError(
          `Failed to update job descriptions: ${
            errorResponse?.message || error?.message || String(error)
          }`
        );
      } catch {
        setError("Failed to update job descriptions.");
      }
    } finally {
      setRolesSaving(false);
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

  /**
   * Determines whether the currently selected roles differ from the
   * roles originally loaded or most recently saved.
   */
  // NEW
  const hasRoleChanges =
    JSON.stringify([...selectedRoles].sort()) !== JSON.stringify([...initialRoles].sort());

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
              disabled={loading || !isDeveloper}
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
        p={2}
        mt={2}
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
          Job descriptions
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Select the roles that best describe your work. These selections are used to personalize
          wiki articles, software and questionnaire recommendations.
        </Typography>

        {rolesSavedSuccessfully && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Job descriptions updated successfully.
          </Alert>
        )}

        {rolesLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={24} />

            <Typography variant="body2">Loading job descriptions...</Typography>
          </Box>
        ) : (
          <>
            <FormGroup>
              {SELECTABLE_ROLES.map((role) => (
                <FormControlLabel
                  key={role}
                  label={ROLE_LABELS[role]}
                  control={
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      disabled={rolesSaving}
                      inputProps={{
                        "aria-label": `${role}-role`
                      }}
                    />
                  }
                />
              ))}
            </FormGroup>

            <Button
              variant="contained"
              onClick={handleSaveRoles}
              disabled={rolesSaving || !hasRoleChanges}
              sx={{ mt: 2 }}
            >
              {rolesSaving ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={18} color="inherit" />

                  <span>Saving...</span>
                </Box>
              ) : (
                "Save"
              )}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SettingsScreen;
