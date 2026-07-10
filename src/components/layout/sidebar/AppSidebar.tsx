import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { Box, Divider, IconButton, List, Typography } from "@mui/material";
import { useState } from "react";

import Logo from "/resources/img/Metatavu-icon.svg";

import SidebarItem from "./SidebarItem";
import { employeeMenu, managementMenu } from "./sidebar-config";

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        width: collapsed ? 72 : 220,
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,

        display: "flex",
        flexDirection: "column",

        bgcolor: "#00647F",
        color: "#FFFFFF",

        transition: "width .25s ease"
      }}
    >
      {/* Logo */}

      <Box
        sx={{
          height: 72,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <img
          src={Logo}
          alt="Metatavu"
          style={{
            width: 38,
            height: 38
          }}
        />
      </Box>

      {/* Employee */}

      {!collapsed && (
        <Typography
          sx={{
            px: 3,
            pt: 1,
            pb: 1,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: "rgba(255,255,255,.65)"
          }}
        >
          EMPLOYEE
        </Typography>
      )}

      <List
        sx={{
          px: 1,
          py: 0
        }}
      >
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
          mx: 2,
          my: 2,
          borderColor: "rgba(255,255,255,.18)"
        }}
      />

      {/* Management */}

      {!collapsed && (
        <Typography
          sx={{
            px: 3,
            pb: 1,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: "rgba(255,255,255,.65)"
          }}
        >
          MANAGEMENT
        </Typography>
      )}

      <List
        sx={{
          px: 1,
          py: 0
        }}
      >
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

      <Divider
        sx={{
          mx: 2,
          borderColor: "rgba(255,255,255,.18)"
        }}
      />

      {/* Collapse button */}

      <Box
        sx={{
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 0 : 2
        }}
      >
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: "#FFFFFF",

            "&:hover": {
              backgroundColor: "rgba(255,255,255,.12)"
            }
          }}
        >
          {collapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
        </IconButton>

        {!collapsed && (
          <Typography
            sx={{
              ml: 1,
              fontSize: 13,
              color: "rgba(255,255,255,.8)"
            }}
          >
            Collapse sidebar
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AppSidebar;
