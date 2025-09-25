import { Button, type SxProps, type Theme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import UserRoleUtils from "src/utils/user-role-utils";
import strings from "src/localization/strings";

interface BackButtonProps {
  onClick?: () => void;
  styles?: SxProps<Theme>;
}

/**
 * Generic back button component with optional click handling and navigation logic.
 * @param props.onClick allows onClick actions to be used where applicable
 * @param props.styles override styling for consistent placement / visualization
 */
const BackButton = (props: BackButtonProps): JSX.Element => {
  const { onClick, styles} = props;
  const navigate = useNavigate();
  const adminMode = UserRoleUtils.adminMode();

  /**
   * Handles back button behavior:
   * - Executes onClick if provided.
   * - Navigates back in history if possible.
   * - Redirects to admin or home page if history is unavailable.
   * 
   */
  const navBack = () => {
  if (onClick) {
    onClick();
    return;
  }

  if (window.history.length > 1) {
    navigate(-1);
  } else if (adminMode) {
    navigate("/admin");
  } else {
    navigate("/");
  }
};

  return (
    <Button
      variant="contained"
      onClick={navBack}
      startIcon={<KeyboardReturn />}
      sx={{
        padding: "10px",
        width: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:active": { transform: "translateX(-1px) scale(0.98)" },
        ...styles
      }}
    >
      <Typography>
        {strings.label.back}
      </Typography>
    </Button>
  );
};

export default BackButton;
