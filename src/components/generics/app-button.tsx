import { Button, type SxProps, type Theme, Typography } from "@mui/material";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

interface AppButtonProps {
  id?: string;
  onClick?: () => void;
  styles?: SxProps<Theme>;
  text?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  fullWidth?: boolean;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "warning" | "success";
}

const AppButton = ({
  id,
  onClick,
  styles,
  text,
  disabled = false,
  type = "button",
  ariaLabel,
  fullWidth = false,
  variant = "contained",
  color = "primary"
}: AppButtonProps): JSX.Element => {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant={variant}
      color={color}
      disabled={disabled}
      type={type}
      fullWidth={fullWidth}
      aria-label={ariaLabel ?? text ?? strings.form.create}
      sx={{
        height: "55px",
        fontWeight: "bold",
        ...styles
      }}
    >
      {text ?? strings.form.create}
    </Button>
  );
};

export default AppButton;
