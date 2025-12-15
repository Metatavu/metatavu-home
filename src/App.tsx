import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { useAtomValue } from "jotai";
import { Settings } from "luxon";
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { languageAtom } from "./atoms/language";
import ErrorHandler from "./components/contexts/error-handler";
import Layout from "./components/layout/layout";
import AuthenticationProvider from "./components/providers/authentication-provider";
import RestrictedContentProvider from "./components/providers/restricted-content-provider";
import NewQuestionnaireBuilder from "./components/questionnaire/new-questionnaire-builder";
import QuestionnaireManager from "./components/questionnaire/questionnaire-manager";
import AdminScreen from "./components/screens/admin-screen";
import AdminVacationManagementScreen from "./components/screens/admin-vacation-management/admin-vacation-management-screen";
import AllSoftwareScreen from "./components/screens/all-software-screen";
import BalanceScreen from "./components/screens/balance-screen";
import CardScreen from "./components/screens/card-screen";
import EmployeeFlextimeScreen from "./components/screens/employee-flextime-screen";
import ErrorScreen from "./components/screens/error-screen";
import HomeScreen from "./components/screens/home-screen";
import MemoScreen from "./components/screens/memo-screen";
import OnCallCalendarScreen from "./components/screens/on-call-calendar-screen";
import QuestionnaireScreen from "./components/screens/questionnaire-screen";
import SettingsScreen from "./components/screens/settings-screen";
import SoftwareRegistryScreen from "./components/screens/software-registry-screen";
import SprintViewScreen from "./components/screens/sprint-view-screen";
import VacationRequestsScreen from "./components/screens/vacation-requests-screen";
import ArticleScreen from "./components/screens/wiki-article-screen";
import WikiDocumentationScreen from "./components/screens/wiki-documentation-screen";
import SoftwareDetails from "./components/software-registry/SoftwareDetails";
import { theme } from "./theme";
import { QuestionnairePreviewMode } from "./types";

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
          path: "/balance",
          element: <BalanceScreen />
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
        {
          path: "/memos",
          element: <MemoScreen />
        },
        {
          path: "/cards",
          element: <CardScreen />
        },
        {
          path: "/questionnaire/:id",
          element: <QuestionnaireManager mode={QuestionnairePreviewMode.FILL} />
        },
        {
          path: "/wiki-documentation",
          element: <WikiDocumentationScreen />
        },
        {
          path: "/wiki-documentation/*",
          element: <ArticleScreen />
        },
        {
          path: "/settings",
          element: <SettingsScreen />
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
          path: "/admin/vacation-management",
          element: <AdminVacationManagementScreen />
        },
        {
          path: "/admin/severa/employee-flextime",
          element: <EmployeeFlextimeScreen />
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
          element: <NewQuestionnaireBuilder />
        },
        {
          path: "/admin/questionnaire/:id/edit",
          element: <QuestionnaireManager mode={QuestionnairePreviewMode.EDIT} />
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
          path: "/admin/wiki-documentation",
          element: <WikiDocumentationScreen />
        },
        {
          path: "/admin/wiki-documentation/*",
          element: <ArticleScreen />
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
