import { createTheme, type Theme } from "@mui/material";
import PoppinsBlack from "../resources/fonts/poppins/Poppins-Black.ttf";
import PoppinsBold from "../resources/fonts/poppins/Poppins-Bold.ttf";
import PoppinsMedium from "../resources/fonts/poppins/Poppins-Medium.ttf";
import PoppinsRegular from "../resources/fonts/poppins/Poppins-Regular.ttf";
import PoppinsSemiBold from "../resources/fonts/poppins/Poppins-SemiBold.ttf";

const createForeground = () => ({
  inversed: "#ffffff",
  positive: "#66ad66",
  negative: "#dd6666"
});

const createBackground = (isDark: boolean) => ({
  default: isDark ? "#181818" : "#ffffff",
  secondary: "#dadada",
  disabled: isDark ? "#797979" : "#c2c2c2",
  accent: isDark ? "#002833" : "#00647f",
  accentSecondary: isDark ? "#005066" : "#e6eff2",
  selected: isDark ? "#002833" : "#99c1cc",
  event: isDark ? "#616161" : "#f2f2f2",
  paper: isDark ? "#303030" : "#ffffff",
  tooltip: isDark ? "#003c4c" : "#002833"
});

const createText = (isDark: boolean) => ({
  primary: isDark ? "#ffffff" : "#222222",
  disabled: "#919191",
  accent: isDark ? "#99c1cc" : "#005066",
  accentSecondary: "#003c4c"
});

const createIcons = (isDark: boolean) => ({
  primary: isDark ? "#ffffff" : "#222222",
  empty: isDark ? "#a9a9a9" : "#494949",
  disabled: isDark ? "#616161" : "#c2c2c2"
});

const createBorder = (isDark: boolean) => ({
  primary: isDark ? "#616161" : "#c2c2c2",
  accent: isDark ? "#99c1cc" : "#005066",
  subtle: isDark ? "#494949" : "#f2f2f2",
  strong: isDark ? "#f2f2f2" : "#181818",
  disabled: isDark ? "#a9a9a9" : "#dadada",
  badgePrimary: isDark ? "#a9a9a9" : "#494949"
});

const createHover = (isDark: boolean) => ({
  primary: isDark ? "#919191" : "#494949",
  secondary: isDark ? "#616161" : "#f2f2f2",
  tag: isDark ? "#338399" : "#99c1cc",
  navigation: isDark ? "#338399" : "#66a2b2"
});

const createChart = (isDark: boolean) => ({
  primary: isDark ? "#99c1cc" : "#66a2b2",
  secondary: isDark ? "#338399" : "#003c4c",
  accent: isDark ? "#b9662e" : "#e77f3a",
  disabledPrimary: isDark ? "#c2c2c2" : "#a9a9a9",
  disabledAccent: isDark ? "#181818" : "#797979",
  disabledSecondary: isDark ? "#919191" : "#494949"
});

const createButtons = (isDark: boolean) => ({
  primary: isDark ? "#ec9961" : "#e77f3a",
  hover: isDark ? "#e77f3a" : "#b9662e",
  secondaryBg: "#fae5d8",
  secondaryHover: "#f7ccb0",
  accent: "#f1b289",
  toggleThumb: "#ffffff",
  disabledBg: isDark ? "#a9a9a9" : "#f2f2f2"
});

const createBadges = () => ({
  statusPending: "#ffca1a",
  stuckBg: "#f9e6e6",
  reviewBg: "#fff4d1",
  reviewAccent: "#66510a",
  deploymentBg: "#efe9f8",
  deploymentAccent: "#5b21b6",
  progressBg: "#eaf5f5",
  progressBgStrong: "#abd8d5",
  progressAccent: "#1a5f5a",
  completedBg: "#cce4cc"
});

/**
 * Builds the color palette for the given theme mode.
 *
 * Delegates to per-category factory functions (createForeground,
 * createBackground, etc.) fields that differ between modes
 * use a ternary within those functions, fields that are identical in both
 * modes are written once. Splitting by category keeps each function's
 * complexity low instead of one large palette object.
 *
 * @param mode - Theme mode ("light" | "dark")
 * @returns Palette object to pass to createTheme
 */
const createPalette = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  return {
    mode,
    foreground: createForeground(),
    background: createBackground(isDark),
    text: createText(isDark),
    icons: createIcons(isDark),
    border: createBorder(isDark),
    hover: createHover(isDark),
    chart: createChart(isDark),
    buttons: createButtons(isDark),
    badges: createBadges()
  };
};

const spaces = {
  none: "0px",
  xxs: "2px",
  xs: "4px",
  s: "8px",
  m: "16px",
  l: "24px",
  xl: "32px",
  xxl: "40px",
  xxxl: "56px",
  negative: "-16px"
};

const radius = {
  xs: "4px",
  s: "8px",
  m: "16px",
  full: "999px"
};

const borders = {
  xs: "0.5px",
  s: "1px",
  m: "3px"
};

const typography = {
  fontFamily: "Poppins, Arial, Helvetica, sans-serif",
  fontWeightRegular: 400,
  fontSize: 16,
  h1: {
    fontWeight: 600,
    fontSize: 40,
    lineHeight: "115%"
  },
  h2: {
    fontWeight: 600,
    fontSize: 32,
    lineHeight: "120%"
  },
  h3: {
    fontWeight: 600,
    fontSize: 24,
    lineHeight: "125%"
  },
  h4: {
    fontWeight: 600,
    fontSize: 20,
    lineHeight: "130%"
  },
  h5: {
    fontWeight: 500,
    fontSize: 20,
    lineHeight: "130%"
  },
  body: {
    fontSize: 16,
    lineHeight: "160%"
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: "160%"
  },
  caption: {
    fontSize: 12,
    lineHeight: "150%"
  },
  captionSmall: {
    fontSize: 10,
    lineHeight: "150%"
  }
};

const cssBaselineFontFaces = `
  @font-face {
    font-family: "Poppins";
    src: local("Poppins"), url(${PoppinsRegular}) format("truetype");
    font-weight: 400;
    font-style: normal;
  }
    @font-face {
    font-family: "Poppins";
    src: local("Poppins"), url(${PoppinsMedium}) format("truetype");
    font-weight: 500;
  }
    @font-face {
    font-family: "Poppins";
    src: local("Poppins"), url(${PoppinsSemiBold}) format("truetype");
    font-weight: 600;
  }
    @font-face {
    font-family: "Poppins";
    src: local("Poppins"), url(${PoppinsBold}) format("truetype");
    font-weight: 700;
  }
  @font-face {
    font-family: "Poppins";
    src: local("Poppins"), url(${PoppinsBlack}) format("truetype");
    font-weight: 900;
  }
`;

const muiAppBarOverrides = {
  defaultProps: {},
  styleOverrides: {
    root: {
      top: 0,
      borderRadius: 0,
      boxShadow: "none",
      borderBottom: "none",
      backgroundImage: "none"
    }
  }
};

const muiTooltipStyleOverrides = {
  tooltip: ({ theme }: { theme: Theme }) => ({
    backgroundColor: theme.palette.background.tooltip,
    color: theme.palette.foreground.inversed,
    borderRadius: theme.radius.s,
    padding: `${theme.spaces.s} ${theme.spaces.s}`,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: theme.spaces.s,
    ...theme.typography.caption,
    fontWeight: 400
  }),
  arrow: ({ theme }: { theme: Theme }) => ({
    color: theme.palette.background.tooltip
  })
};

const muiAvatarOverrides = {
  styleOverrides: {
    root: {
      height: 48,
      width: 48
    }
  }
};

const muiCardStyleOverrides = {
  root: ({ theme }: { theme: Theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: "background-color 0.2s ease"
  })
};

const muiPaperStyleOverrides = {
  root: ({ theme }: { theme: Theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary
  })
};

const muiButtonOverrides = {
  styleOverrides: {
    root: {
      fontWeight: "bold"
    }
  }
};

const muiMenuStyleOverrides = {
  paper: ({ theme }: { theme: Theme }) => ({
    boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.12)",
    borderRadius: theme.radius.s
  })
};

const muiSwitchStyleOverrides = {
  root: ({ theme }: { theme: Theme }) => ({
    width: 48,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: theme.spaces.xxs,
      margin: 0,
      "&.Mui-checked": {
        transform: "translateX(22px)",
        color: theme.palette.background.default,
        "& + .MuiSwitch-track": {
          backgroundColor: theme.toggle.on,
          opacity: 1,
          border: 0
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5
        }
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: theme.toggle.on
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5
      }
    },
    "& .MuiSwitch-thumb": {
      width: 22,
      height: 22
    },
    "& .MuiSwitch-track": {
      borderRadius: theme.radius.m,
      backgroundColor: theme.toggle.off,
      opacity: 1
    }
  })
};

const muiTextFieldOverriedes = {
  root: ({ theme }: { theme: Theme }) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.radius.s,

      "& fieldset": {
        borderColor: theme.palette.border.primary
      },

      "&:hover fieldset": {
        borderColor: theme.palette.border.accent
      },

      "&.Mui-focused fieldset": {
        borderColor: theme.palette.border.primary
      }
    }
  })
};

/**
 * Creates MUI theme for the application.
 *
 * Extends default MUI theme with:
 * - Custom color palette, spacing, radius and border scale tokens
 * - Typography system
 * - Component-level style overrides (requires further work, not updated yet)
 *
 * Light and dark mode are both supported via createPalette(mode).
 *
 * @param mode - Theme mode ("light | "dark")
 * @returns Configured MUI Theme object
 */
export const createAppTheme = (mode: "light" | "dark"): Theme => {
  const toggle = {
    on: "#00647f",
    off: mode === "light" ? "#c2c2c2" : "#797979"
  };

  const segmentedControl = {
  default: "#fae5d8",
  selected: "#f1b289",
  hover: "#f7ccb0",
  border: "#f1b289"
};

  return createTheme({
    palette: createPalette(mode),
    spaces,
    radius,
    borders,
    toggle,
    segmentedControl,
    typography,
    components: {
      MuiCssBaseline: {
        styleOverrides: cssBaselineFontFaces
      },
      MuiAppBar: muiAppBarOverrides,
      MuiTooltip: {
        defaultProps: {
          arrow: true
        },
        styleOverrides: muiTooltipStyleOverrides
      },
      MuiAvatar: muiAvatarOverrides,
      MuiCard: {
        defaultProps: {
          elevation: 4
        },
        styleOverrides: muiCardStyleOverrides
      },
      MuiPaper: {
        styleOverrides: muiPaperStyleOverrides
      },
      MuiButton: muiButtonOverrides,
      MuiMenu: {
        styleOverrides: muiMenuStyleOverrides
      },
      MuiSwitch: {
        styleOverrides: muiSwitchStyleOverrides
      },
      MuiTextField: {
        styleOverrides: muiTextFieldOverriedes
      }
    }
  });
};

/**
 * Color tokens for wiki screen UI.
 *
 * TODO:
 * These values have not yet been updated to match UI changes
 * and need further review.
 */
export const wikiScreenColors = (theme: Theme) => ({
  button: {
    main: theme.palette.background.paper,
    hover: theme.palette.buttons.hover,
    text: theme.palette.text.primary,
    border: theme.palette.divider
  }
});

/**
 * Custom theme tokens and styles.
 *
 * TODO:
 * These are yet to be aligned with UI changes and should
 * be revisited.
 */
export const customTheme = (theme: Theme) => ({
  colors: {
    paidGreen: "#7bd15c",
    unpaidRed: "#ff6384",
    onCallHighlight: "#ff9800"
  },
  customStyles: {
    onCallBox: {
      display: "inline-block",
      borderRadius: theme.shape.borderRadius,
      px: 3,
      py: 2,
      textAlign: "center",
      mx: "auto",
      mb: 3,
      mt: 3,
      maxWidth: 600
    },
    listViewTypography: {
      borderRadius: theme.shape.borderRadius,
      px: 3,
      py: 2,
      fontWeight: "bold",
      display: "inline-block",
      textAlign: "center",
      pointerEvents: "none"
    },
    listViewButton: {
      textTransform: "none",
      padding: 0,
      minWidth: "unset",
      borderRadius: 4,
      boxShadow: `0 0 0 2px ${theme.palette.divider}`,
      backgroundColor: "transparent",
      mx: 1.5,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "box-shadow 0.2s ease",
      "&:hover": {
        boxShadow: `0 0 0 3px ${theme.palette.divider}`,
        "& .MuiTypography-root": { backgroundColor: theme.palette.hover.secondary }
      },
      "&.Mui-disabled": {
        boxShadow: `0 0 0 2px ${theme.palette.action.disabled}`,
        "& .MuiTypography-root": {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.text.disabled
        }
      }
    }
  }
});
