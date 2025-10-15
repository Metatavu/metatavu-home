import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import { Button, type SxProps, type Theme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import strings from "src/localization/strings";
import { useUserRole } from "src/hooks/use-user-role";

interface BackButtonProps {
  onClick?: () => void;
  styles?: SxProps<Theme>;
}

/**
 * Generic back button component with optional click handling and navigation logic.
 * @param props.onClick Optional handler to override default navigation from forms
 * @param props.styles Optional override for styling/positioning button
 */
const BackButton = (props: BackButtonProps): JSX.Element => {
  const { onClick, styles } = props;
  const navigate = useNavigate();
  const {adminMode} = useUserRole()

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
    } else {
      navigate(adminMode ? "/admin" : "/");
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
        height: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:active": { transform: "translateX(-1px) scale(0.98)" },
        ...styles
      }}
    >
      <Typography>{strings.label.back}</Typography>
    </Button>
  );
};

export default BackButton;
