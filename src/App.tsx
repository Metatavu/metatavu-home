import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthenticationProvider from "./components/providers/authentication-provider";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import VacationRequestsScreen from "./components/screens/vacation-requests-screen";
import TimebankScreen from "./components/screens/timebank-screen";
import { useAtomValue } from "jotai";
import { languageAtom } from "./atoms/language";
import HomeScreen from "./components/screens/home-screen";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import Layout from "./components/layout/layout";
import ErrorHandler from "./components/contexts/error-handler";
import ErrorScreen from "./components/screens/error-screen";
import TimebankViewAllScreen from "./components/screens/timebank-view-all-screen";
import AdminScreen from "./components/screens/admin-screen";
import { Settings } from "luxon";
import { useMemo } from "react";
import RestrictedContentProvider from "./components/providers/restricted-content-provider";
import SprintViewScreen from "./components/screens/sprint-view-screen";
import OnCallCalendarScreen from "./components/screens/on-call-calendar-screen";

/**
 * Application component
 */
const App = () => {
  const language = useAtomValue(languageAtom);

  useMemo(() => {
    Settings.defaultLocale = language;
  }, [language]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorScreen />,
      children: [
        {
          path: "/",
          element: <HomeScreen />
        },
        {
          path: "/vacations",
          element: <VacationRequestsScreen />
        },
        {
          path: "/timebank",
          element: <TimebankScreen />
        },
        {
          path: "/sprintview",
          element: <SprintViewScreen />
        },
        {
          path: "/oncall",
          element: <OnCallCalendarScreen />
        }
      ]
    },
    {
      path: "/admin",
      element: (
        <RestrictedContentProvider>
          <Layout />
        </RestrictedContentProvider>
      ),
      errorElement: <ErrorScreen />,
      children: [
        {
          path: "/admin",
          element: <AdminScreen />
        },
        {
          path: "/admin/vacations",
          element: <VacationRequestsScreen />
        },
        {
          path: "/admin/timebank/viewall",
          element: <TimebankViewAllScreen />
        },
        {
          path: "/admin/sprintview",
          element: <SprintViewScreen />
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
