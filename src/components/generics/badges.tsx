import {
  CheckCircleOutlineRounded,
  CircleOutlined,
  HighlightOffRounded,
  ShieldOutlined,
  StarBorderOutlined
} from "@mui/icons-material";
import { Chip, Icon, type SxProps, type Theme, useTheme } from "@mui/material";
import type React from "react";
import type { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { getBadgeColor } from "src/utils/badgeColorUtils";
import VacationStatusIndicator from "../vacation-requests-table/vacationStatusIndicator";

export type IconBadgeVariant = "empty" | "success" | "failed";

interface IconBadgeProps {
  variant: IconBadgeVariant;
}

interface IconBadgeConfig {
  icon: React.ReactElement;
  color: string;
}
/**
 * Display status icon based on provided variant.
 *
 * @param props - Component props
 * @param props.variant - Determines icon and color used:
 * "empty", "success" or "failed".
 * @returns Themed MUI icon representing status.
 */
export const IconBadge = ({ variant }: IconBadgeProps) => {
  const theme = useTheme();

  const IconVariants: Record<IconBadgeVariant, IconBadgeConfig> = {
    empty: {
      icon: <CircleOutlined />,
      color: theme.palette.icons.primary
    },
    success: {
      icon: <CheckCircleOutlineRounded />,
      color: theme.palette.foreground.positive
    },
    failed: {
      icon: <HighlightOffRounded />,
      color: theme.palette.foreground.negative
    }
  };
  return (
    <Icon sx={{ color: IconVariants[variant].color, height: "fit-content" }}>
      {IconVariants[variant].icon}
    </Icon>
  );
};

type PillBadgeVariant = "approvalBadge" | "statusBadge" | "wikiBadge";

/**
 * TODO: status for "statusBadge" and "wikiBadge" were set to "string" for
 * testing purposes. As these variants are not yet fully implemented, type must
 * be changed once the screens are updated.
 */
type PillBadgeProps =
  | {
      variant: "approvalBadge";
      status: VacationRequestStatuses;
      children: React.ReactNode;
    }
  | {
      variant: "statusBadge";
      status: string;
      children: React.ReactNode;
    }
  | {
      variant: "wikiBadge";
      status: string;
      children: React.ReactNode;
    };

/**
 * Pillbadge with different variants.
 *
 * Variants:
 * - `approvalBadge` -> Vacation request approval state badge
 * - `statusBadge` -> Status badge for project/task status
 * - `wikiBadge`-> Badge to show document type in WikiDocumentation
 *
 * @param props - PillBadge component props
 * @param props.variant - Badge style and icon
 * @param props.status - Value used for styling and icon
 * @param props.children - Badge label
 *
 * @returns Themed MUI Chip component.
 */
export const PillBadge = ({ variant, status, children }: PillBadgeProps) => {
  const theme = useTheme();

  const approvalIcon =
    variant === "approvalBadge" ? <VacationStatusIndicator statusColor={status} /> : undefined;

  const icons: Partial<Record<PillBadgeVariant, React.ReactElement>> = {
    approvalBadge: approvalIcon,
    wikiBadge: status === "rule" ? <ShieldOutlined /> : <StarBorderOutlined />
  };

  const VariantStyles: Record<PillBadgeVariant, SxProps<Theme>> = {
    approvalBadge: {
      borderColor: getBadgeColor(status, theme),
      borderWidth: theme.borders.s,
      borderRadius: theme.radius.m
    },
    statusBadge: {
      color: getBadgeColor(status, theme),
      borderWidth: theme.borders.s,
      borderRadius: theme.radius.m,
      fontWeight: 500
    },
    wikiBadge: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.radius.m,
      borderWidth: 0,
      paddingBottom: 0,
      paddingTop: 0
    }
  };
  return (
    <Chip
      icon={icons[variant]}
      label={children}
      variant="outlined"
      sx={{
        height: "fit-content",
        maxWidth: "fit-content",
        padding: theme.spaces.xxs,
        paddingInline: theme.spaces.s,
        textDecorationLine: status === "canceled" ? "line-through" : "none",
        margin: 0.5,
        ...VariantStyles[variant]
      }}
    />
  );
};
