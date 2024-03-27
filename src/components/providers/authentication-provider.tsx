import config from "../../app/config";
import { authAtom, userProfileAtom } from "../../atoms/auth";
import { useAtom, useSetAtom } from "jotai";
import Keycloak from "keycloak-js";
import { ReactNode, useCallback, useEffect } from "react";
import { personsAtom } from "../../atoms/person";
import { useApi } from "../../hooks/use-api";

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
  const setPersons = useSetAtom(personsAtom);
  const { personsApi } = useApi();

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
        } catch (error) {
          console.error("Could not load user profile", error);
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
  const getPersonsList = async () => {
    const fetchedPersons = await personsApi.listPersons({ active: true });
    setPersons(fetchedPersons);
  };

  useEffect(() => {
    if (auth) getPersonsList();
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
