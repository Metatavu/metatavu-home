import { Button, type Theme, useTheme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import strings from "src/localization/strings";

/**
 * Visual variants for the AppButton component.
 *
 * - primary: filled orange button, main call-to-action
 * - secondary: light orange background, secondary actions
 * - tertiary: ghost/transparent button, low-emphasis actions
 * - borderless: button with no border, used for inline actions
 */
export type AppButtonVariant = "primary" | "secondary" | "tertiary" | "borderless";

interface AppButtonProps {
  id?: string;
  onClick?: () => void;
  sx?: SystemStyleObject<Theme>;
  text?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  startIcon?: ReactNode;
  /** @default "primary" */
  variant?: AppButtonVariant;
}

/**
 * Maps AppButtonVariant to MUI sx styles using theme tokens.
 */
const useVariantStyles = (variant: AppButtonVariant): SystemStyleObject<Theme> => {
  const theme = useTheme();

  const variants: Record<AppButtonVariant, SystemStyleObject<Theme>> = {
    primary: {
      bgcolor: theme.palette.buttons.primary,
      color: theme.palette.text.primary,
      border: "none",
      "&:hover": { bgcolor: theme.palette.buttons.hover },
      "&:disabled": {
        bgcolor: theme.palette.buttons.disabledBg,
        color: theme.palette.text.disabled
      }
    },
    secondary: {
      bgcolor: theme.palette.buttons.secondaryBg,
      color: theme.palette.text.primary,
      "&:hover": { bgcolor: theme.palette.buttons.secondaryHover },
      "&:disabled": {
        bgcolor: theme.palette.buttons.disabledBg,
        color: theme.palette.text.disabled
      }
    },
    tertiary: {
      bgcolor: "transparent",
      color: theme.palette.text.primary,
      border: `${theme.borders.s} solid ${theme.palette.buttons.primary}`,
      "&:hover": { bgcolor: theme.palette.buttons.secondaryHover },
      "&:disabled": {
        bgcolor: theme.palette.buttons.disabledBg,
        color: theme.palette.text.disabled,
        border: "none"
      }
    },
    borderless: {
      bgcolor: "transparent",
      color: theme.palette.text.primary,
      border: "none",
      "&:hover": {
        textDecoration: "underline",
        backgroundColor: "transparent"
      }
    }
  };

  return variants[variant];
};

/**
 * A themed button component that wraps MUI's Button with consistent
 * sizing, typography, spacing and variant-based styling. Supports
 * icons, full-width layout and custom styles through the sx prop.
 */
const AppButton = ({
  id,
  onClick,
  sx,
  text,
  disabled = false,
  type = "button",
  fullWidth = false,
  startIcon,
  variant = "primary"
}: AppButtonProps): JSX.Element => {
  const variantStyles = useVariantStyles(variant);
  const theme = useTheme();

  return (
    <Button
      id={id}
      onClick={onClick}
      disabled={disabled}
      type={type}
      fullWidth={fullWidth}
      variant="contained"
      disableElevation
      startIcon={startIcon}
      sx={{
        height: "55px",
        padding: `${theme.spaces.s} ${theme.spaces.m}`,
        textTransform: "none",
        ...theme.typography.bodySmall,
        borderRadius: theme.radius.s,
        ...variantStyles,
        ...sx
      }}
    >
      {text ?? strings.form.create}
    </Button>
  );
};

export default AppButton;
