import type { Theme } from "@mui/material/styles";

/**
 * Get color corresponding the PillBadge status
 *
 * @param status - status of the PillBadge
 * @param theme - MUI theme object
 * @returns color configuration for badge styling
 */
export const getBadgeColor = (status: string, theme: Theme) =>
  ({
    APPROVED: {
      color: theme.palette.text.primary,
      borderColor: theme.palette.foreground.positive,
      backgroundColor: "transparent",
      indicatorColor: theme.palette.foreground.positive
    },
    DECLINED: {
      color: theme.palette.text.primary,
      borderColor: theme.palette.foreground.negative,
      backgroundColor: "transparent",
      indicatorColor: theme.palette.foreground.negative
    },
    PENDING: {
      color: theme.palette.text.primary,
      borderColor: theme.palette.badges.statusPending,
      backgroundColor: "transparent",
      indicatorColor: theme.palette.badges.statusPending
    },
    disabled: {
      color: theme.palette.text.disabled,
      borderColor: theme.palette.border.disabled,
      backgroundColor: "transparent",
      indicatorColor: theme.palette.icons.disabled
    },
    toDo: {
      color: theme.palette.border.badgePrimary,
      borderColor: theme.palette.border.badgePrimary,
      backgroundColor: theme.palette.background.secondary
    },
    canceled: {
      color: theme.palette.border.badgePrimary,
      borderColor: theme.palette.border.badgePrimary,
      backgroundColor: theme.palette.background.secondary
    },
    inPlanning: {
      color: theme.palette.badges.progressAccent,
      borderColor: theme.palette.badges.progressAccent,
      backgroundColor: theme.palette.badges.progressBgStrong
    },
    inProgress: {
      color: theme.palette.badges.progressAccent,
      borderColor: theme.palette.badges.progressAccent,
      backgroundColor: theme.palette.badges.progressBg
    },
    stuck: {
      color: theme.palette.foreground.negative,
      borderColor: theme.palette.foreground.negative,
      backgroundColor: theme.palette.badges.stuckBg
    },
    review: {
      color: theme.palette.badges.reviewAccent,
      borderColor: theme.palette.badges.reviewAccent,
      backgroundColor: theme.palette.badges.reviewBg
    },
    deployment: {
      color: theme.palette.badges.deploymentAccent,
      borderColor: theme.palette.badges.deploymentAccent,
      backgroundColor: theme.palette.badges.deploymentBg
    },
    done: {
      color: theme.palette.foreground.positive,
      borderColor: theme.palette.foreground.positive,
      backgroundColor: theme.palette.badges.completedBg
    }
  })[status];
