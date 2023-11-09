import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthenticationProvider from "./components/providers/authentication-provider";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import VacationRequestsScreen from "./components/screens/vacation-requests-screen";
import BalanceScreen from "./components/screens/timebank-screen";
import { useAtomValue } from "jotai";
import { languageAtom } from "./atoms/language";
import HomeScreen from "./components/screens/home-screen";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import Layout from "./components/layout/layout";
import ErrorHandler from "./components/contexts/error-handler";
import ErrorScreen from "./components/screens/error-screen";
import UserRoleUtils from "./utils/user-role-utils";
import strings from "./localization/strings";
import AdminScreen from "./components/screens/admin-screen";
import TimebankViewAllScreen from "./components/screens/timebank-view-all-screen";

/**
 * Application component
 */
const App = () => {
  const language = useAtomValue(languageAtom);
  const admin = UserRoleUtils.isAdmin();

  const AdminRouteErrorScreen = () => (
    <ErrorScreen
      message={strings.adminRouteAccess.notAdmin}
      title={strings.adminRouteAccess.noAccess}
    />
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomeScreen />
        },
        {
          path: "/vacations",
          element: <VacationRequestsScreen />,
          errorElement: <ErrorScreen />
        },
        {
          path: "/timebank",
          element: <BalanceScreen />,
          errorElement: <ErrorScreen />
        }
      ]
    },
    {
      path: "/admin",
      element: <Layout />,
      errorElement: <ErrorScreen />,
      children: [
        {
          path: "/admin",
          element: admin ? <AdminScreen /> : <AdminRouteErrorScreen />
        },
        {
          path: "/admin/timebank",
          element: admin ? <BalanceScreen /> : <AdminRouteErrorScreen />
        },
        {
          path: "/admin/timebank/viewall",
          element: admin ? <TimebankViewAllScreen /> : <AdminRouteErrorScreen />
        }
      ]
    }
  ]);
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <ErrorHandler>
          <AuthenticationProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={language}>
              <CssBaseline>
                <RouterProvider router={router} />
              </CssBaseline>
            </LocalizationProvider>
          </AuthenticationProvider>
        </ErrorHandler>
      </ThemeProvider>
    </div>
  );
};

export default App;
