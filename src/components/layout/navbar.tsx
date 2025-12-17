import { Lock } from "@mui/icons-material";
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
  Tooltip
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { avatarsAtom, personsAtom } from "src/atoms/person";
//import type { Person } from "src/generated/client";
import config from "src/app/config";
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { avatarsAtom } from "src/atoms/person";
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
  // NOTE: The Person type cannot be used here because it was previously imported from the removed timebank client.
  //const persons: Person[] = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const { slackAvatarsApi } = useLambdasApi();
  const navigate = useNavigate();
  const loggedInUserId = userProfile?.id;
  const loggedInPersonAvatar =
    avatars.find((avatar) => avatar.personId === loggedInUserId)?.imageOriginal || "";

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
   * Fetch Slack avatars
   */
  const getSlackAvatars = async () => {
    if (avatars) return;
    try {
      const fetchedAvatars = await slackAvatarsApi.slackAvatar();
      setAvatars(fetchedAvatars);
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
                {<Avatar src={loggedInPersonAvatar} />}
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
                <SettingsIcon sx={{ mr: 1 }} /> {strings.header.settings}
              </MenuItem>
              <MenuItem onClick={handleClickLogOut}>
                <Lock sx={{ mr: 1 }} />
                {strings.header.logout}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
