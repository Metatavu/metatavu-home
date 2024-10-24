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
import QuestionnaireScreen from "./components/screens/questionnaire-screen";
import NewQuizScreen from "./components/screens/new-questionnaire-screen";
import SoftwareRegistryScreen from "./components/screens/software-registry-screen";
import AllSoftwareScreen from "./components/screens/all-software-screen";
import SoftwareDetails from "./components/software-registry/SoftwareDetails";

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
          path: "/softwareregistry",
          element: <SoftwareRegistryScreen />
        },
        {
          path: "/softwareregistry/:id",
          element: <SoftwareDetails />
        },
        {
          path: "/softwareregistry/allsoftware",
          element: <AllSoftwareScreen />
        },
        {
          path: "/softwareregistry/allsoftware/:id",
          element: <SoftwareDetails />
        },
        {
          path: "/questionnaire",
          element: <QuestionnaireScreen />
        },
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
        },
        {
          path: "/admin/allsoftware",
          element: <AllSoftwareScreen />
        },
        {
          path: "/admin/allsoftware/:id",
          element: <SoftwareDetails />
        },
        {
          path: "/admin/questionnaire",
          element: <QuestionnaireScreen />
        },
        {
          path: "/admin/newQuestionnaire",
          element: <NewQuizScreen />
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
