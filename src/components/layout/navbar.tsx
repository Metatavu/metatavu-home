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
  Typography
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const auth = useAtomValue(authAtom);
  const menuId = useId();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [avatars, setAvatars] = useAtom(avatarsAtom);
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
    if (avatars?.imageOriginal) return;
    try {
      if (!loggedInUserEmail) return;
      const encodedEmail = encodeURIComponent(loggedInUserEmail);
      const fetchedAvatars = await slackAvatarsApi.getSlackUserAvatarByEmail({
        email: encodedEmail
      });
      setAvatars({ imageOriginal: fetchedAvatars.imageOriginal });
    } catch (error) {
      setError(`${strings.error.fetchSlackAvatarsFailed}: ${error}`);
    }
  };

  useEffect(() => {
    getSlackAvatars();
  }, []);

  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NavItems />
          <LocalizationButtons />

          <Box>
            <Tooltip title={strings.header.openUserMenu}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {<Avatar src={avatars?.imageOriginal || ""} />}
              </IconButton>
            </Tooltip>
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
