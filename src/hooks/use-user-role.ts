import { useAtomValue } from "jotai";
import { useLocation } from "react-router-dom";
import { authAtom } from "../atoms/auth";

/**
 * Custom hook to derive user role-based access flags from authentication state.
 *
 * @returns An object containing booleans for specific roles and role-based modes.
 */
const useUserRole = () => {
  const accessToken = useAtomValue(authAtom)?.token;

  /**
   * Checks whether the current user has the specified role.
   *
   * @param role - The name of the role to check for.
   * @returns `true` if the user has the role, otherwise `false`.
   */
  const isRole = (role: string): boolean => {
    return accessToken?.realm_access?.roles.includes(role) ?? false;
  };

  const isAdmin = isRole("admin");
  const isDeveloper = isRole("developer");
  const isTester = isRole("tester");
  const isAccountant = isRole("accountant");

  const { pathname } = useLocation();

  const adminMode = isAdmin && pathname.startsWith("/admin");

  const developerMode = isDeveloper;

  return {
    isAdmin,
    isDeveloper,
    isTester,
    isAccountant,
    adminMode,
    developerMode
  };
};

export default useUserRole;
