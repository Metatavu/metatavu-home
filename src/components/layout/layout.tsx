import { Container } from "@mui/material";
import { Outlet } from "react-router";
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
  </>
);

export default Layout;
