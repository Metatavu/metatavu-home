import { createTheme, type Theme } from "@mui/material";
import PoppinsBlack from "../resources/fonts/poppins/Poppins-Black.ttf";
import PoppinsBold from "../resources/fonts/poppins/Poppins-Bold.ttf";
import PoppinsMedium from "../resources/fonts/poppins/Poppins-Medium.ttf";
import PoppinsRegular from "../resources/fonts/poppins/Poppins-Regular.ttf";
import PoppinsSemiBold from "../resources/fonts/poppins/Poppins-SemiBold.ttf";

const lightPalette = {
  mode: "light" as const,
  foreground: {
    inversed: "#ffffff",
    positive: "#66ad66",
    negative: "#dd6666"
  },
  background: {
    default: "#ffffff",
    secondary: "#dadada",
    disabled: "#c2c2c2",
    accent: "#00647f",
    accentSecondary: "#e6eff2",
    selected: "#99c1cc",
    event: "#f2f2f2",
    paper: "#ffffff",
    tooltip: "#002833"
  },
  text: {
    primary: "#222222",
    disabled: "#919191",
    accent: "#005066",
    accentSecondary: "#003c4c"
  },
  icons: {
    primary: "#222222",
    empty: "#494949",
    disabled: "#c2c2c2"
  },
  border: {
    primary: "#c2c2c2",
    accent: "#005066",
    subtle: "#f2f2f2",
    strong: "#181818",
    disabled: "#dadada",
    badgePrimary: "#494949"
  },
  hover: {
    primary: "#494949",
    secondary: "#f2f2f2",
    tag: "#99c1cc",
    navigation: "#66a2b2"
  },
  chart: {
    primary: "#66a2b2",
    secondary: "#003c4c",
    accent: "#e77f3a",
    disabledPrimary: "#a9a9a9",
    disabledAccent: "#797979",
    disabledSecondary: "#494949"
  },
  buttons: {
    primary: "#e77f3a",
    hover: "#b9662e",
    secondaryBg: "#fae5d8",
    secondaryHover: "#f7ccb0",
    accent: "#f1b289",
    toggleThumb: "#ffffff",
    disabledBg: "#f2f2f2"
  },
  badges: {
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
  }
};

const darkPalette = {
  mode: "dark" as const,
  foreground: {
    inversed: "#ffffff",
    positive: "#66ad66",
    negative: "#dd6666"
  },
  background: {
    default: "#181818",
    secondary: "#dadada",
    disabled: "#797979",
    accent: "#002833",
    accentSecondary: "#005066",
    selected: "#002833",
    event: "#616161",
    paper: "#303030",
    tooltip: "#003c4c"
  },
  text: {
    primary: "#ffffff",
    disabled: "#919191",
    accent: "#99c1cc",
    accentSecondary: "#003c4c"
  },
  icons: {
    primary: "#ffffff",
    empty: "#a9a9a9",
    disabled: "#616161"
  },
  border: {
    primary: "#616161",
    accent: "#99c1cc",
    subtle: "#494949",
    strong: "#f2f2f2",
    disabled: "#a9a9a9",
    badgePrimary: "#a9a9a9"
  },
  hover: {
    primary: "#919191",
    secondary: "#616161",
    tag: "#338399",
    navigation: "#338399"
  },
  chart: {
    primary: "#99c1cc",
    secondary: "#338399",
    accent: "#b9662e",
    disabledPrimary: "#c2c2c2",
    disabledAccent: "#181818",
    disabledSecondary: "#919191"
  },
  buttons: {
    primary: "#ec9961",
    hover: "#e77f3a",
    secondaryBg: "#fae5d8",
    secondaryHover: "#f7ccb0",
    accent: "#f1b289",
    toggleThumb: "#ffffff",
    disabledBg: "#a9a9a9"
  },
  badges: {
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
  }
};

/**
 * Creates MUI theme for the application.
 *
 * Extends default MUI theme with:
 * - Custom color palette, spacing, radius and border scale tokens
 * - Typography system
 * - Component-level style overrides (requires further work, not updated yet)
 *
 * Light and dark mode are both supported via lightPalette/darkPalette.
 *
 * @param mode - Theme mode ("light | "dark")
 * @returns Configured MUI Theme object
 */
export const createAppTheme = (mode: "light" | "dark"): Theme => {
  const toggle = {
    on: "#00647f",
    off: mode === "light" ? "#c2c2c2" : "#797979"
  };

  return createTheme({
    palette: mode === "dark" ? darkPalette : lightPalette,
    spaces: {
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
    },
    radius: {
      xs: "4px",
      s: "8px",
      m: "16px",
      full: "999px"
    },
    borders: {
      xs: "0.5px",
      s: "1px",
      m: "3px"
    },
    toggle,
    typography: {
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
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
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
      `
      },
      MuiAppBar: {
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
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true
        },
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: theme.palette.background.tooltip,
            color: theme.palette.foreground.inversed,
            borderRadius: theme.radius.s,
            padding: `${theme.spaces.s} ${theme.spaces.s}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: theme.spaces.s,
            ...theme.typography.caption,
            fontWeight: 400
          }),
          arrow: ({ theme }) => ({
            color: theme.palette.background.tooltip
          })
        }
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            height: 48,
            width: 48
          }
        }
      },
      MuiCard: {
        defaultProps: {
          elevation: 4
        },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: "background-color 0.2s ease"
          })
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary
          })
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold"
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) => ({
            boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.12)",
            borderRadius: theme.radius.s
          })
        }
      },
      MuiSwitch: {
        styleOverrides: {
          root: ({ theme }) => ({
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
        }
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