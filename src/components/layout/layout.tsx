import { Container } from "@mui/material";
import { Outlet } from "react-router";
import { ScrollRestoration } from "react-router-dom";
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
      <ScrollRestoration />
    </Container>
  </>
);

export default Layout;
