import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Avatar,
  Box,
  Container,
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
import { authAtom, userProfileAtom } from "src/atoms/auth";
import { avatarsAtom } from "src/atoms/avatar";
import { errorAtom } from "src/atoms/error";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import LocalizationButtons from "../layout-components/localization-buttons";

/**
 * NavBar component
 */
const NavBar = () => {
  const theme = useTheme();
  const auth = useAtomValue(authAtom);
  const menuId = useId();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [avatars, setAvatars] = useAtom(avatarsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const { slackAvatarsApi } = useLambdasApi();
  const navigate = useNavigate();
  const loggedInUserEmail = userProfile?.email || undefined;

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleClickLogOut = () => {
    auth?.logout();
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

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
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: "none"
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: "flex" }}>
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
                <Box
                  onClick={handleOpenUserMenu}
                  sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <Avatar
                    src={avatars?.image_original || ""}
                    sx={{ bgcolor: theme.palette.background.accent }}
                  >
                    {!avatars?.image_original &&
                      `${userProfile?.firstName?.[0] ?? ""}${userProfile?.lastName?.[0] ?? ""}`}
                  </Avatar>
                  <KeyboardArrowDown sx={{ color: theme.palette.text.primary }} />
                </Box>
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
