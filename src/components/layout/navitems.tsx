import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { type MouseEvent, useState } from "react";
import { Link } from "react-router-dom";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import Logo from "../../../resources/img/Metatavu-icon.svg";
import { useLocation } from "react-router-dom";
/**
 * Navigation Items component
 */
const NavItems = () => {
  const [currentPage, setCurrentPage] = useState("");
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const { isAdmin } = useUserRole();
  const location = useLocation();


  /**
   * Handles opening navigation menu
   */
  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  /**
   * Handles closing navigation menu
   */
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  /**
   * Handles navigation menu item click
   */
  const handleNavItemClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLLinkElement;
    setCurrentPage(target.innerText);
  };

  return (
    <>
      <Link to="/">
        <Button sx={{ marginLeft: -1, height: 48 }}>
          <img
            src={Logo}
            alt={strings.header.logoAlt}
            style={{ height: 40, filter: "invert(100%)" }}
          />
        </Button>
      </Link>
      <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
        {/* MOBILE MENU */}
        <IconButton
          size="large"
          aria-label="mobile menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left"
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{
            display: { xs: "block", md: "none" }
          }}
        >
          <MenuItem
            component={Link}
            to={"/"}
            key={`${strings.header.timebank}mobile`}
            onClick={handleNavItemClick}
          >
            Employee
          </MenuItem>
          {isAdmin && (
            <MenuItem
              component={Link}
              to={"/admin"}
              key="adminMenuItem"
              onClick={handleNavItemClick}
            >
              {strings.header.admin}
            </MenuItem>
          )}
        </Menu>
        <Typography variant="button" marginTop={1.5}>
          {currentPage}
        </Typography>
      </Box>
      {/* DESKTOP MENU */}
      <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
        <Link
          key={strings.header.timebank}
          to={"/"}
          style={{ margin: 2, display: "block", textDecoration: "none"}}
          onClick={handleNavItemClick}
        >
          <Button
          variant={location.pathname === "/" ? "contained" : "text"}
          sx={{
            borderRadius: 20,
            px:2,
          }}
          >
            Employee
            </Button>
        </Link>
        {isAdmin && (
          <Link to={"/admin"} style={{ margin: 2, display: "block", textDecoration: "none"}}>
            <Button
            variant={location.pathname.startsWith("/admin") ? "contained" : "text"}
            sx={{
              borderRadius: 20,
              px: 2,
            }}
            >
              {strings.header.admin}
              </Button>
          </Link>
        )}
      </Box>
    </>
  );
};

export default NavItems;