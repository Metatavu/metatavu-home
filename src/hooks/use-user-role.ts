import  { useAtomValue } from "jotai";
import { authAtom } from "../atoms/auth";
import { useLocation } from "react-router-dom";


 export const useUserRole = () => {
  const accessToken = useAtomValue(authAtom)?.token;

  //Utility function to check if user has specific role
  const isRole = (role: string) => {
    return accessToken?.realm_access?.roles.includes(role) ?? false;
  };

  //Role checks
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