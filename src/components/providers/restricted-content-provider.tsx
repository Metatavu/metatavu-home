import type { ReactNode } from "react";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import RouteAccessErrorScreen from "../screens/route-access-error-screen";

/**
 * Supported role types for route restriction
 */
export type RequiredRole = "admin" | "developer" | "tester";

/**
 * Component properties
 */
interface Props {
  children: ReactNode;
  requiredRole?: RequiredRole;
}

/**
 * Maps a required role to its corresponding error title string.
 */
const getErrorTitle = (role: RequiredRole): string => {
  switch (role) {
    case "admin":
      return strings.adminRouteAccess.noAccess;
    case "developer":
    case "tester":
      return strings.routeAccess.noAccess;
  }
};

/**
 * Maps a required role to its corresponding error message string.
 */
const getErrorMessage = (role: RequiredRole): string => {
  switch (role) {
    case "admin":
      return strings.adminRouteAccess.notAdmin;
    case "developer":
      return strings.routeAccess.requiresDeveloper;
    case "tester":
      return strings.routeAccess.requiresTester;
  }
};

/**
 * Restricted content provider component.
 * Renders an access-denied screen if the current user lacks the required role.
 *
 * @param props component properties
 * @returns access denied screen if restricted, child components otherwise
 */
const RestrictedContentProvider = ({ children, requiredRole = "admin" }: Props) => {
  const { isAdmin, isDeveloper, isTester } = useUserRole();

  const hasAccess = (() => {
    switch (requiredRole) {
      case "admin":
        return isAdmin;
      case "developer":
        return isDeveloper;
      case "tester":
        return isTester;
    }
  })();

  if (!hasAccess) {
    return (
      <RouteAccessErrorScreen
        title={getErrorTitle(requiredRole)}
        message={getErrorMessage(requiredRole)}
      />
    );
  }

  return <>{children}</>;
};

export default RestrictedContentProvider;
