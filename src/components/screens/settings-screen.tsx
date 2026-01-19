import { Box, CircularProgress, Switch, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

type SettingsScreenProps = {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
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
          ...(userProfile.attributes || {}),
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
      const updatedAttributes = { ...(userProfile.attributes || {}) } as Record<
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

  return (
    <Box p={2}>
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
      <Box p={2} bgcolor="grey.100" borderRadius={2}>
        <Typography variant="h5" gutterBottom>
          Dark Mode
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            Light
          </Typography>
          <Switch
            checked={mode === "dark"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            inputProps={{ "aria-label": "dark-mode-toggle" }}
          />
          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            Dark
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsScreen;
