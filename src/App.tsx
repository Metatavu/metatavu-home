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
import PipedriveScreen from "./components/screens/pipedrive-screen";
import SalesProjectData from "./components/pipedrive-project/salesproject-data";

/**
 * Application component
 */
const App = () => {
  const language = useAtomValue(languageAtom);

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
        },
        {
          path: "/salesview",
          element: <PipedriveScreen />,
          errorElement: <ErrorScreen />,
        },
        {
          path: "/salesview/:rowtype/:id",
          element: <SalesProjectData />,
          errorElement: <ErrorScreen />,
        }
        /*
        ,
        {
          path: "/salesview/:deals/:id",
          element: <SalesProjectData />,
          errorElement: <ErrorScreen />,
        },
        {
          path: "/salesview/:dealswon/:id",
          element: <SalesProjectData />,
          errorElement: <ErrorScreen />,
        }
        */
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
