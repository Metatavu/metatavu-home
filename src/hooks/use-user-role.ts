import  { useAtomValue } from "jotai";
import { authAtom } from "../atoms/auth";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to check the user roles
 */
 export const useUserRole = () => {
  const accessToken = useAtomValue(authAtom)?.token;

  const isRole = (role: string) => {
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
    developerMode,
  };
};

export default useUserRole