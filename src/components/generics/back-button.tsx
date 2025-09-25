import { Button, type SxProps, type Theme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import UserRoleUtils from "src/utils/user-role-utils";
import strings from "src/localization/strings";

interface BackButtonProps {
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * @param props.onClick allows onClick actions to be used where applicable
 * @param props.sx override styling for consistent placement / visualization
 */
const BackButton = (props: BackButtonProps): JSX.Element => {
  const { onClick, sx} = props;
  const navigate = useNavigate();
  const adminMode = UserRoleUtils.adminMode();

  /**
  * Generic back button with optional pre-navigation onClick,
  * explicit redirect, and user/admin fallback route.
  *  
  * @param navBack Handles action of onClick
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
        ...sx
      }}
    >
      <Typography>
        {strings.label.back}
      </Typography>
    </Button>
  );
};

export default BackButton;
