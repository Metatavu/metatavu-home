import { Box, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { type ThemeMode, ThemeModes } from "src/types/index";
import { RoleSettings, ToggleBox } from "./settingsComponents";

type SettingsScreenProps = {
  screenColorMode: ThemeMode;
  setScreenColorMode: (screenColorMode: ThemeMode) => void;
};

/**TODO: revokeSeveraOptIn and grantSeveraOptInConsent have repetitive code.
 * Could these be revisited and maybe combined to make this file more clear?
 *
 * Settings screen component
 *
 * @param screenColorMode - Colormode of the screen (light/dark)
 * @returns Screen consisting all user settings such as severa opt in, darkmode toggle and roles.
 */
const SettingsScreen = ({ screenColorMode, setScreenColorMode }: SettingsScreenProps) => {
  const { isDeveloper } = useUserRole();
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
   * Toggles the screen color mode between light and dark. Updates the screenColorMode state and saves the new value in localStorage.
   */
  const handleModeToggle = () => {
    const newScreenColorMode: ThemeMode =
      screenColorMode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT;
    setScreenColorMode(newScreenColorMode);
    localStorage.setItem("screenColorMode", newScreenColorMode);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography
        variant="h1"
        sx={{
          alignSelf: "center"
        }}
      >
        {strings.header.settings}
      </Typography>
      <ToggleBox
        isConsentGiven={isConsentGiven}
        loading={loading}
        isDeveloper={isDeveloper}
        handleChange={handleToggleChange}
        variant="connections"
      />
      <ToggleBox
        isConsentGiven={isConsentGiven}
        loading={loading}
        isDeveloper={isDeveloper}
        handleChange={handleModeToggle}
        variant="appearance"
      />
      <RoleSettings userProfile={userProfile} />
    </Box>
  );
};

export default SettingsScreen;
