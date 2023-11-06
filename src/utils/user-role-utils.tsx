import { useAtomValue } from "jotai";
import { authAtom } from "../atoms/auth";
import { useLocation } from "react-router";

/**
 * User Role Utils class
 */
export default class UserRoleUtils {
  /**
   * Check if the logged-in user has an admin role
   *
   * @param accessToken keycloak access token
   * @returns boolean
   */
  public static isAdmin = () => {
    const accessToken = useAtomValue(authAtom)?.token;
    return !!accessToken?.realm_access && accessToken.realm_access?.roles.includes("admin");
  };

  /**
   * Check if the logged-in user has admin role and is in admin route
   *
   * @returns boolean
   */
  public static adminMode = () => {
    const { pathname } = useLocation();
    const adminPathname = pathname.startsWith("/admin");
    return UserRoleUtils.isAdmin() && adminPathname;
  };
}
