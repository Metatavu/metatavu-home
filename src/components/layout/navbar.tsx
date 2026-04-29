import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { avatarsAtom, personsAtom } from "src/atoms/person";
//import type { Person } from "src/generated/client";
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { avatarsAtom } from "src/atoms/avatar";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import LocalizationButtons from "../layout-components/localization-buttons";
import NavItems from "./navitems";

/**
 * NavBar component
 */
const NavBar = () => {
  const theme = useTheme();
  const auth = useAtomValue(authAtom);
  const menuId = useId();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [avatars, setAvatars] = useAtom(avatarsAtom);
  // NOTE: The Person type cannot be used here because it was previously imported from the removed timebank client.
  //const persons: Person[] = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const { slackAvatarsApi } = useLambdasApi();
  const navigate = useNavigate();
  const loggedInUserEmail = userProfile?.email || undefined;

  /**
   * Handles opening user menu
   *
   * @param event mouse event
   */
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  /**
   * Handles closing user menu
   */
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Handles logging out
   */
  const handleClickLogOut = () => {
    auth?.logout();
  };

  /**
   * handles open settings screen
   */
  const handleSettingsClick = () => {
    navigate("/settings");
  };

  /**
   * Fetch Slack avatars for logged in user
   */
  const getSlackAvatars = async () => {
    if (avatars?.image_original) return;
    try {
      if (!loggedInUserEmail) return;
      const encodedEmail = encodeURIComponent(loggedInUserEmail);
      const fetchedAvatars = await slackAvatarsApi.getSlackUserAvatarByEmail({
        email: encodedEmail
      });
      setAvatars({ image_original: fetchedAvatars.imageOriginal });
    } catch (error: any) {
      const errorMessage = await error.response?.json();
      setError(`${strings.error.fetchSlackAvatarsFailed}: ${errorMessage?.message}`);
    }
  };

  useEffect(() => {
    getSlackAvatars();
  }, []);

  return (
    <AppBar
      position="relative"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: "flex" }}>
          <NavItems />
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <LocalizationButtons />

            <Box>
              <Tooltip title={strings.header.openUserMenu}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  {<Avatar src={avatars?.image_original || ""} />}
                </IconButton>
              </Tooltip>
            </Box>
            <Menu
              id={menuId}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleSettingsClick}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography>{strings.header.settings}</Typography>
              </MenuItem>
              <MenuItem onClick={handleClickLogOut}>
                <LogoutIcon sx={{ mr: 1 }} />
                <Typography>{strings.header.logout}</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
