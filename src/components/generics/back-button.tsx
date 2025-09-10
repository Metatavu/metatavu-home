import { Button, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import UserRoleUtils from "src/utils/user-role-utils";

interface BackButtonProps {
  fallbackPath?: string;
  isNavigating?: boolean;
  sx?: SxProps<Theme>;
  label?: string;
}
/**
 * Generic back button based on history/admin role/fallback path
 * 
 * @param fallbackPath Fallback path if history is empty and user is not admin
 * @param isNavigating Disables the button if true to avoid mistaken double navigation
 * @param sx Additional MUI sx styling
 * @param label Fixed text label for the button
 */
const BackButton = ({
  fallbackPath = "/",
  sx,
  label = "Back",
  isNavigating = false,
}: BackButtonProps) => {
  const navigate = useNavigate();
  const isAdmin = UserRoleUtils.adminMode();

  /**
   * @param navBack Handles onClick event for navigation
   */
  const navBack = () => {
    if (window.history.length > 1) navigate(-1);
    else if (isAdmin) navigate("/admin");
    else navigate(fallbackPath);
  };

  return (
    <Button
      variant="contained"
      disabled={isNavigating}
      onClick={navBack}
      startIcon={<KeyboardReturn />}
      sx={{
        mt: 3,
        padding: "10px",
        width: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:active": { transform: "translateX(-1px) scale(0.98)" },
        ...sx,
      }}
    >
      <Typography variant="button" component="span">
        {label}
      </Typography>
    </Button>
  );
};

export default BackButton;