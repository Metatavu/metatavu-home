import { KeyboardTabOutlined } from "@mui/icons-material";
import { Box, Divider, List, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import AppButton from "src/components/generics/buttons/app-button";
import AppIconButton from "src/components/generics/buttons/app-icon-button";
import strings from "src/localization/strings";
import Logo from "/resources/img/Metatavu-icon.svg";
import SidebarItem from "./SidebarItem";
import { getEmployeeMenu, getManagementMenu } from "./sidebar-config";

const AppSidebar = () => {
  const theme = useTheme();
  const employeeMenu = getEmployeeMenu();
  const managementMenu = getManagementMenu();;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        width: collapsed ? 72 : 260,
        height: "100vh",
        p: collapsed ? theme.spaces.s : theme.spaces.l,
        rowGap: theme.spaces.m,
        position: "sticky",
        top: 0,
        flexShrink: 0,

        display: "flex",
        flexDirection: "column",
        alignItems: collapsed ? "center" : "unset",

        bgcolor: theme.palette.background.accent,

        transition: "width .25s ease"
      }}
    >
      {/* Logo */}

      <Box
        sx={{
          height: 72,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center"
        }}
      >
        <img
          src={Logo}
          alt="Metatavu"
          style={{
            width: 52,
            height: 40
          }}
        />
      </Box>

      <List>
        {employeeMenu.map((item) => (
          <SidebarItem
            key={item.route}
            title={item.title}
            route={item.route}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </List>

      {/* Divider */}

      <Divider
        sx={{
          width: collapsed ? 40 : 196,
          py: theme.spaces.m,
          borderColor: theme.palette.foreground.inversed
        }}
      />

      {/* Management */}

      {!collapsed && (
        <Typography
          variant="body"
          sx={{
            pt: theme.spaces.xxl,
            color: theme.palette.foreground.inversed
          }}
        >
          {strings.navigation.management}
        </Typography>
      )}

      <List>
        {managementMenu.map((item) => (
          <SidebarItem
            key={item.route}
            title={item.title}
            route={item.route}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </List>

      {/* Push collapse button to bottom */}

      <Box sx={{ flexGrow: 1 }} />

      {/* Collapse button */}

      <Box
        sx={{
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "unset",
          p: collapsed ? theme.spaces.none : theme.spaces.l,
          pb: theme.spaces.xxxl
        }}
      >
        {!collapsed ? (
          <AppButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              color: theme.palette.foreground.inversed,
              width: 152,
              fontFamily: theme.typography.body,
              fontWeight: 400,
              textWrap: "nowrap",
              justifyContent: "flex-start",
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.hover.navigation
              }
            }}
            text={strings.navigation.collapse}
            disabled={false}
            startIcon={<KeyboardTabOutlined sx={{ transform: "scale(1.2) rotate(180deg)" }} />}
            variant="borderless"
          />
        ) : (
          <AppIconButton
            icon={
              <KeyboardTabOutlined
                sx={{
                  fontSize: 24,
                  color: theme.palette.foreground.inversed,
                  "&:hover": {
                    color: theme.palette.hover.navigation
                  }
                }}
              />
            }
            onClick={() => setCollapsed(!collapsed)}
            disabled={false}
            variant="small"
          />
        )}
      </Box>
    </Box>
  );
};

export default AppSidebar;
