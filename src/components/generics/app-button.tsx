import { Button, type SxProps, type Theme } from "@mui/material";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

/**
 * Props for the AppButton component.
 */
interface AppButtonProps {
  /**
   * Optional HTML id attribute for the button.
   */
  id?: string;

  /**
   * Function executed when the button is clicked.
   */
  onClick?: () => void;

  /**
   * Custom MUI styles applied through the `sx` prop.
   */
  styles?: SxProps<Theme>;

  /**
   * Text displayed inside the button.
   * If not provided, a default localized text is used.
   */
  text?: string;

  /**
   * Disables the button when set to true.
   * @default false
   */
  disabled?: boolean;

  /**
   * Native HTML button type.
   * @default "button"
   */
  type?: "button" | "submit" | "reset";
  /**
   * Makes the button take the full width of its container.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * MUI button variant.
   * @default "contained"
   */
  variant?: "contained" | "outlined" | "text";

  /**
   * MUI button color.
   * @default "primary"
   */
  color?: "primary" | "secondary" | "error" | "warning" | "success";
}

/**
 * Reusable application button component based on MUI Button.
 *
 * Provides consistent styling, accessibility support,
 * localization fallback text, and customizable variants.
 *
 * @param props Component properties.
 * @returns Styled MUI button component.
 */
const AppButton = ({
  id,
  onClick,
  styles,
  text,
  disabled = false,
  type = "button",
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
