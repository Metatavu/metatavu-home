//import { Container } from "@mui/material";
//import { Outlet } from "react-router";
//import GlobalSnackbar from "../generics/global-snackbar";
//import NavBar from "./navbar";

/**
 * Layout component
 */
//const Layout = () => (
//<>
//<Container>
//    <NavBar />
//</Container>
//<Container sx={{ marginTop: 4 }}>
//   <Outlet />
//</Container>
//<GlobalSnackbar />
//</>
//);

//export default Layout;
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import NavBar from "./navbar";
import AppSidebar from "./sidebar/AppSidebar";

const Layout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <AppSidebar />

      <Box sx={{ flex: 1 }}>
        <NavBar />

        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
