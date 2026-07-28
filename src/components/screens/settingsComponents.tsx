import { Box, CircularProgress, Divider, Switch, Typography, useTheme } from "@mui/material";
import { useSetAtom } from "jotai";
import type { KeycloakProfile } from "keycloak-js";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import { Role } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useSnackbar } from "src/hooks/use-snackbar";
import strings from "src/localization/strings";
import { ThemeModes } from "src/types/index";
import AppCheckbox from "../generics/appCheckbox";
import AppToggle from "../generics/appToggle";
import AppButton from "../generics/buttons/app-button";

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
const getRoleLabels = (role: Role): string =>
  ({
    [Role.DEVELOPER]: strings.roles.developer,
    [Role.DESIGNER]: strings.roles.designer,
    [Role.ARCHITECT]: strings.roles.architect,
    [Role.ADMIN]: "Admin",
    [Role.MANAGEMENT]: strings.roles.management,
    [Role.TRAINEE]: strings.roles.trainee
  })[role];
/**
 * Component responsible for showing user role settings. User can select multiple
 * roles mathing their job to see appropriate recommendations based on their chosen roles.
 * De-selected roles will be removed from the user.
 *
 * @param userProfile - KeycloakProfile of the user
 * @returns Styled list of checkboxes where user can choose their roles.
 */
export const RoleSettings = ({ userProfile }: { userProfile?: KeycloakProfile }) => {
  const showSnackbar = useSnackbar();
  const { usersApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const theme = useTheme();
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
   * load the logged-in user's existing roles when the settings page opens.
   */
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!userProfile?.id) {
        return;
      }

      setRolesLoading(true);

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

          showSnackbar(
            `${strings.error.fetchRolesError}: ${errorResponse?.message || error?.message || String(error)}`,
            "error"
          );
        } catch {
          showSnackbar(strings.error.fetchRolesError, "error");
        }
      } finally {
        setRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [userProfile?.id, usersApi, setError]);

  /**
   * adds or remove one role from theselected roles.
   */
  const handleRoleToggle = (role: Role) => {
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
  const handleSaveRoles = async () => {
    if (!userProfile?.id) {
      setError(strings.error.missingUserId);
      return;
    }

    setRolesSaving(true);
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
      showSnackbar(strings.snackbar.rolesUpdated);
    } catch (error: any) {
      setSelectedRoles([...initialRoles]);
      try {
        const errorResponse = await error?.response?.json();
        showSnackbar(
          `${strings.error.rolesError}: ${errorResponse?.message || error?.message || String(error)}`,
          "error"
        );
      } catch {
        showSnackbar(strings.error.rolesError, "error");
      }
    } finally {
      setRolesSaving(false);
    }
  };

  /**
   * Determines whether the currently selected roles differ from the
   * roles originally loaded or most recently saved.
   */
  const sortRoles = (roles: Role[]) => [...roles].sort((a, b) => a.localeCompare(b));

  const hasRoleChanges =
    JSON.stringify(sortRoles(selectedRoles)) !== JSON.stringify(sortRoles(initialRoles));

  /*   function showSnacbar(jobsSaved: string): import("react").ReactNode {
    throw new Error("Function not implemented.");
  } */

  return (
    <Box m={theme.spaces.xl}>
      <Typography variant="h4">{strings.settingsScreen.jobs}</Typography>

      <Typography sx={{ ml: theme.spaces.xl, lineHeight: theme.spaces.xxxl }} variant="caption">
        {strings.settingsScreen.jobsDescription}
      </Typography>

      {rolesLoading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={24} />

          <Typography variant="body2">{strings.settingsScreen.descriptionsLoading}</Typography>
        </Box>
      ) : (
        <Box sx={{ ml: theme.spaces.xl }}>
          {SELECTABLE_ROLES.map((role) => (
            <AppCheckbox
              key={role}
              label={getRoleLabels(role)}
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              disabled={rolesSaving}
              ariaLabel={`${getRoleLabels(role)}-${strings.roles.role}`}
            />
          ))}

          <AppButton
            variant="primary"
            onClick={handleSaveRoles}
            disabled={rolesSaving || !hasRoleChanges}
            text={rolesSaving ? strings.placeHolder.saving : strings.label.save}
            startIcon={rolesSaving ? <CircularProgress size={24} /> : null}
            fullWidth={false}
            sx={{ height: 42, mt: theme.spaces.m }}
          />
        </Box>
      )}
    </Box>
  );
};

interface ToggleProps {
  isConsentGiven: boolean;
  loading: boolean;
  isDeveloper: boolean;
  variant: string;
  handleChange: any;
}

export const ToggleBox = ({
  isConsentGiven,
  loading,
  isDeveloper,
  variant,
  handleChange
}: ToggleProps) => {
  const theme = useTheme();
  const content =
    variant === "connections"
      ? {
          header: strings.settingsScreen.connections,
          toggleHeader: strings.settingsScreen.connectSevera,
          description: strings.settingsScreen.severaDescription,
          checked: isConsentGiven,
          slotProps: strings.settingsScreen.connectSevera
        }
      : {
          header: strings.settingsScreen.appearance,
          toggleHeader: strings.settingsScreen.dark,
          description: "",
          checked: theme.palette.mode === ThemeModes.DARK,
          slotProps: strings.settingsScreen.darkMode
        };

  return (
    <>
      <Box>
        <Typography variant="h4" sx={{ m: theme.spaces.xl }}>
          {content.header}
        </Typography>
        <Box
          ml={theme.spaces.xxxl}
          mb={theme.spaces.xl}
          display="flex"
          flexDirection="column"
          flexWrap="wrap"
          maxHeight={50}
          width={400}
        >
          <Typography variant="body" sx={{ fontWeight: 500 }}>
            {content.toggleHeader}
          </Typography>
          <Typography variant="caption">{content.description}</Typography>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <AppToggle
              checked={content.checked}
              onChange={handleChange}
              ariaLabel={content.slotProps}
              disabled={loading || !isDeveloper}
            />

            <Box
              sx={{
                width: 28,
                display: "flex",
                justifyContent: "center"
              }}
            >
              {loading && variant === "connections" && <CircularProgress size={20} />}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderWidth: theme.borders.s }} />
    </>
  );
};
