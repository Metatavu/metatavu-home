import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import Logo from "../../../resources/img/Metatavu-icon.svg";
import Button from "@mui/material/Button";
import { MouseEvent, useState } from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import strings from "../../localization/strings";
import UserRoleUtils from "../../utils/user-role-utils";

/**
 * Navigation Items component
 */
const NavItems = () => {
  const [currentPage, setCurrentPage] = useState("");
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const admin = UserRoleUtils.isAdmin();

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
            {strings.header.home}
          </MenuItem>
          {admin && (
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
          style={{ margin: 2, display: "block" }}
          onClick={handleNavItemClick}
        >
          <Button>{strings.header.home}</Button>
        </Link>
        {admin && (
          <Link to={"/admin"} style={{ margin: 2, display: "block" }}>
            <Button>{strings.header.admin}</Button>
          </Link>
        )}
      </Box>
    </>
  );
};

export default NavItems;
