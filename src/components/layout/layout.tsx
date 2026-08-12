import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalSnackbar from "../generics/global-snackbar";
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
        <GlobalSnackbar />
      </Box>
    </Box>
  );
};

export default Layout;
