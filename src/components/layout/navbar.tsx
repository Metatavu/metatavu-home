import { type MouseEvent, useEffect, useState } from "react";
import {
  MenuItem,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  Container,
  Tooltip,
  Avatar
} from "@mui/material";
import LocalizationButtons from "../layout-components/localization-buttons";
import strings from "src/localization/strings";
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import NavItems from "./navitems";
import SyncButton from "./sync-button";
import { avatarsAtom, personsAtom } from "src/atoms/person";
import type { Person } from "src/generated/client";
import config from "src/app/config";
import { useLambdasApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";

/**
 * NavBar component
 */
const NavBar = () => {
  const auth = useAtomValue(authAtom);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [avatars, setAvatars] = useAtom(avatarsAtom);
  const [loggedInPersonAvatar, setLoggedInPersonAvatar] = useState<string>();
  const persons: Person[] = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const { slackAvatarsApi } = useLambdasApi();
  const loggedInPerson = persons.find(
    (person: Person) =>
      person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );

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
   * Fetch Slack avatars and sets logged in user avatar
   */
  const getSlackAvatars = async () => {
    if (!loggedInPerson) return;
    try {
      if (!avatars.length) {
        const fetchedAvatars = await slackAvatarsApi.slackAvatar();
        setAvatars(fetchedAvatars);
        setLoggedInPersonAvatar(fetchedAvatars.find((avatar) => loggedInPerson?.id === avatar.personId)?.imageOriginal || "");
      }
      else {
        setLoggedInPersonAvatar(avatars.find((avatar) => loggedInPerson?.id === avatar.personId)?.imageOriginal || "");
      }  
    }
    catch (error) {
      setError(`${strings.error.fetchSlackAvatarsFailed}: ${error}`);
    }
  };

  useEffect(() => {
    getSlackAvatars();
  }, [loggedInPerson]);

  return (
    <>
      <AppBar position="relative">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <NavItems />
            {import.meta.env.DEV && <SyncButton />}
            <LocalizationButtons />
            <Box>
              <Tooltip title={strings.header.openUserMenu}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar src={loggedInPersonAvatar} />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
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
                <MenuItem onClick={handleClickLogOut}>{strings.header.logout}</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBar;
