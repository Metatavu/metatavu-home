import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
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

  const selected = location.pathname === route;

  return (
    <Tooltip title={collapsed ? title : ""} placement="right">
      <ListItemButton
        selected={selected}
        onClick={() => navigate(route)}
        sx={{
          mx: 1,
          mb: 0.5,
          px: 1.5,
          minHeight: 42,
          borderRadius: "8px",

          justifyContent: collapsed ? "center" : "flex-start",

          color: "#FFFFFF",

          "&:hover": {
            backgroundColor: "rgba(255,255,255,.08)"
          },

          "&.Mui-selected": {
            backgroundColor: "#A7D6DF",
            color: "#045E74"
          },

          "&.Mui-selected:hover": {
            backgroundColor: "#A7D6DF"
          }
        }}
      >
        <ListItemIcon
          sx={{
            color: "inherit",
            minWidth: collapsed ? 0 : 36,
            justifyContent: "center"
          }}
        >
          <Icon />
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: "inherit"
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
};

export default SidebarItem;
