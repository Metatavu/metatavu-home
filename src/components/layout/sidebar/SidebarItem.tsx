import { ListItemButton, ListItemIcon, ListItemText, Tooltip, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarItemProps {
  title: string;
  route: string;
  icon: React.ElementType;
  collapsed?: boolean;
}

const SidebarItem = ({ title, route, icon: Icon, collapsed = false }: SidebarItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const selected = location.pathname === route;

  return (
    <Tooltip title={collapsed ? title : ""} placement="right">
      <ListItemButton
        selected={selected}
        onClick={() => navigate(route)}
        sx={{
          minHeight: collapsed ? 40 : 42,
          width: collapsed ? 40 : "min-content",
          borderRadius: theme.radius.s,
          textWrap: "nowrap",

          justifyContent: collapsed ? "center" : "flex-start",

          color: theme.palette.foreground.inversed,

          "&:hover": {
            color: theme.palette.hover.navigation,
            backgroundColor: "transparent"
          },

          "&.Mui-selected": {
            backgroundColor: theme.palette.background.selected,
            color: theme.palette.text.accent
          },

          "&.Mui-selected:hover": {
            backgroundColor: theme.palette.background.selected,
            color: theme.palette.foreground.inversed
          }
        }}
      >
        <ListItemIcon
          sx={{
            color: "inherit",
            minWidth: collapsed ? 0 : 36
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={title}
            slotProps={{
              primary: {
                sx: {
                  fontSize: 14,
                  fontWeight: 600,
                  color: "inherit"
                }
              }
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
};

export default SidebarItem;
