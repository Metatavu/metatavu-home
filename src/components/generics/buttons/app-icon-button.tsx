import { IconButton, type Theme, Tooltip, useTheme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";

/**
 * Visual variants for the AppIconButton component.
 *
 * - default: light background button, used for standard icon actions
 * - small: transparent background button, used for compact or inline icon actions
 */
export type AppIconButtonVariant = "default" | "small";

interface AppIconButtonProps {
  /** Icon element to render inside the button. */
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Tooltip text displayed on hover. */
  tooltip?: string;
  /** @default "default" */
  variant?: AppIconButtonVariant;
  sx?: SystemStyleObject<Theme>;
}

/**
 * Maps AppIconButtonVariant to MUI sx styles using theme tokens.
 */
const useVariantStyles = (variant: AppIconButtonVariant): SystemStyleObject<Theme> => {
  const theme = useTheme();

  const variants: Record<AppIconButtonVariant, SystemStyleObject<Theme>> = {
    default: {
      bgcolor: theme.palette.buttons.secondaryBg,

      "&:hover": {
        bgcolor: theme.palette.buttons.secondaryHover
      },
      "&:disabled": {
        bgcolor: theme.palette.buttons.disabledBg,
        color: theme.palette.text.disabled
      }
    },

    small: {
      bgcolor: "transparent",
      "&:hover": {
        bgcolor: "transparent"
      },
      "&:disabled": {
        bgcolor: theme.palette.buttons.disabledBg,
        color: theme.palette.text.disabled
      }
    }
  };

  return variants[variant];
};

/**
 * A themed icon button component that wraps MUI's IconButton with consistent
 * sizing, border radius, and variant-based styling. Optionally displays a
 * tooltip on hover.
 */
const AppIconButton = ({
  icon,
  onClick,
  disabled = false,
  sx,
  tooltip,
  variant = "default"
}: AppIconButtonProps): JSX.Element => {
  const theme = useTheme();
  const variantStyles = useVariantStyles(variant);

  return (
    <Tooltip title={tooltip}>
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.s,
            color: theme.palette.text.primary,

            ...variantStyles,
            ...sx
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default AppIconButton;
