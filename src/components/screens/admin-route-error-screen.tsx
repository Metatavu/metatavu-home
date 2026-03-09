import { useEffect } from "react";
import { useNavigate } from "react-router";
import strings from "src/localization/strings";
import ErrorScreen from "./error-screen";

/**
 * Component properties
 */
interface Props {
  title?: string;
  message?: string;
}

/**
 * Route access error screen component.
 * Redirects to home after 4 seconds.
 */
const AdminRouteErrorScreen = ({
  title = strings.adminRouteAccess.noAccess,
  message = strings.adminRouteAccess.notAdmin
}: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return <ErrorScreen message={message} title={title} />;
};

export default AdminRouteErrorScreen;
