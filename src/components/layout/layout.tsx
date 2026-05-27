import { Container } from "@mui/material";
import { Outlet } from "react-router";
import GlobalSnackbar from "../generics/global-snackbar";
import NavBar from "./navbar";

/**
 * Layout component
 */
const Layout = () => (
  <>
    <Container>
      <NavBar />
    </Container>
    <Container sx={{ marginTop: 4 }}>
      <Outlet />
    </Container>
    <GlobalSnackbar />
  </>
);

export default Layout;
