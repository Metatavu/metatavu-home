import { useAtom, useSetAtom } from "jotai";
import Keycloak from "keycloak-js";
import { type ReactNode, useCallback, useEffect } from "react";
import config from "src/app/config";
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

interface Props {
  children: ReactNode;
}

const keycloak = new Keycloak(config.auth);

/**
 * Provides Keycloak authentication functions, such as login and logout
 */
const AuthenticationProvider = ({ children }: Props) => {
  const [auth, setAuth] = useAtom(authAtom);
  const setUserProfile = useSetAtom(userProfileAtom);
  const setUsers = useSetAtom(usersAtom);
  const setError = useSetAtom(errorAtom);
  const { usersApi } = useLambdasApi();

  const updateAuthData = useCallback(() => {
    setAuth({
      token: keycloak?.tokenParsed,
      tokenRaw: keycloak?.token,
      logout: () => keycloak?.logout({ redirectUri: window.location.origin })
    });

    setUserProfile(keycloak.profile);
  }, [auth]);

  const clearAuthData = useCallback(() => {
    setAuth(undefined);
    setUserProfile(undefined);
  }, [auth]);

  const initAuth = useCallback(async (): Promise<void> => {
    try {
      keycloak.onTokenExpired = () => keycloak.updateToken(5);

      keycloak.onAuthRefreshError = () => keycloak.login();
      keycloak.onAuthRefreshSuccess = () => {
        updateAuthData();
      };

      keycloak.onAuthError = (error) => {
        console.error(error);
      };
      keycloak.onAuthSuccess = async () => {
        try {
          await keycloak.loadUserProfile();
        } catch (error: any) {
          const errorMessage = await error?.response?.json();
          setError(`${strings.error.loadUserProfileFailed}: ${errorMessage?.message || error}`);
        }

        updateAuthData();
      };

      keycloak.onAuthLogout = () => {
        clearAuthData();
        keycloak.login();
      };

      const keycloakInitialized = await keycloak.init({
        onLoad: "check-sso",
        checkLoginIframe: false
      });

      if (!keycloakInitialized) {
        await keycloak.login();
      }
    } catch (error) {
      console.error(error);
    }
  }, [auth]);

  /**
   * Sets the logged in timebank person from keycloak ID into global state
   */
  const getUsersList = async () => {
    if (!usersApi) {
      console.error("usersApi is undefined");
      return;
    }
    const fetchedUsers = await usersApi.listUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    if (auth) {
      getUsersList();
    }
  }, [auth]);

  /**
   * Initializes authentication when component mounts
   */
  useEffect(() => {
    if (keycloak.authenticated === undefined) initAuth();
  }, []);

  if (!auth) return null;

  return children;
};

export default AuthenticationProvider;
