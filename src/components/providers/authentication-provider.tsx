import config from "../../app/config";
import { authAtom, userProfileAtom } from "../../atoms/auth";
import { useAtom, useSetAtom } from "jotai";
import Keycloak from "keycloak-js";
import { useCallback, useEffect } from "react";
import { personAtom, personsAtom } from "../../atoms/person";
import { useApi } from "../../hooks/use-api";
import { Person } from "../../generated/client";

interface Props {
  children: JSX.Element;
}

const keycloak = new Keycloak(config.auth);

/**
 * Provides Keycloak authentication functions, such as login and logout
 */
const AuthenticationProvider = ({ children }: Props) => {
  const [auth, setAuth] = useAtom(authAtom);
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const [person, setPerson] = useAtom(personAtom);
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

      await keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false
      });
    } catch (error) {
      console.error(error);
    }
  }, [auth]);

  /**
   * Sets the logged in person from keycloak ID as global state variable (atom)
   */
  const getLoggedInPerson = async (): Promise<void> => {
    const fetchedPersons = await personsApi.listPersons({ active: true });
    const loggedInPerson = fetchedPersons.filter(
      (person : Person) => person.keycloakId === config.keycloak.id || userProfile?.id
    )[0];
    setPerson(loggedInPerson);
    setPersons(fetchedPersons);
  };

  useEffect(() => {
    if (auth) getLoggedInPerson();
  }, [auth || person]);

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
