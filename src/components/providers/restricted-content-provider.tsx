import { type ReactNode, useEffect, useState } from "react";
import useUserRole from "src/hooks/use-user-role";
import AdminRouteErrorScreen from "../screens/admin-route-error-screen";

/**
 * Component properties
 */
interface Props {
  children: ReactNode;
}

/**
 * Restricted content provider component
 *
 * @param props component properties
 * @returns admin route screen if restricted, child components otherwise
 */
const RestrictedContentProvider = ({ children }: Props) => {
  const {isAdmin} = useUserRole();
  const [restricted, setRestricted] = useState(!isAdmin);

  useEffect(() => {
    if (isAdmin) {
      setRestricted(false);
    } else {
      setRestricted(true);
    }
  }, [isAdmin]);

  if (restricted) {
    return <AdminRouteErrorScreen />;
  }

  return <>{children}</>;
};

export default RestrictedContentProvider;
