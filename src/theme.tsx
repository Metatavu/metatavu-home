import { createTheme, type Theme } from "@mui/material";
import PoppinsBlack from "../resources/fonts/poppins/Poppins-Black.ttf";
import PoppinsBold from "../resources/fonts/poppins/Poppins-Bold.ttf";
import PoppinsMedium from "../resources/fonts/poppins/Poppins-Medium.ttf";
import PoppinsRegular from "../resources/fonts/poppins/Poppins-Regular.ttf";
import PoppinsSemiBold from "../resources/fonts/poppins/Poppins-SemiBold.ttf";

export const createAppTheme = (mode: "light" | "dark"): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#fff" : "#222"
      },
      secondary: {
        main: "#F47D38"
      },
      info: {
        main: "#1976d2"
      },
      background: {
        default: mode === "dark" ? "#121212" : "#f5f5f5",
        paper: mode === "dark" ? "#1e1e1e" : "#fff"
      },
      text: {
        primary: mode === "dark" ? "#fff" : "#1a1a1a",
        secondary: mode === "dark" ? "#bdbdbd" : "#555"
      },
      success: {
        main: "#4caf50",
        dark: "#45a049",
        contrastText: "#fff"
      },
      error: {
        main: "#f44336",
        dark: "#da190b",
        contrastText: "#fff"
      },
      divider: mode === "dark" ? "#444" : "#e0e0e0",
      action: {
        hover: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        selected: mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
        disabledBackground: mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
      }
    },
    typography: {
      fontFamily: "Poppins",
      fontWeightRegular: 400,
      fontSize: 15,
      h2: {
        fontWeight: 500,
        fontSize: 45
      },
      h3: {
        fontWeight: 700,
        fontSize: 30
      },
      h4: {
        fontWeight: 600,
        fontSize: 20
      },
      h6: {
        fontWeight: 700,
        fontSize: 20
      },
      body1: {
        fontWeight: 400,
        fontSize: 16
      },
      body2: {
        fontWeight: 400,
        fontSize: 16
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
        defaultProps: {
          color: "default"
        },
        styleOverrides: {
          root: {
            top: "1em",
            borderRadius: 15
          }
        }
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true
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
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: theme.palette.action.hover
            }
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
      MuiChip: {
        defaultProps: {
          color: "default"
        },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main),
            fontWeight: "600",
            borderRadius: "5px"
          })
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold"
          }
        }
      }
    }
  });

export const wikiScreenColors = (theme: Theme) => ({
  button: {
    main: theme.palette.background.paper,
    hover: theme.palette.action.hover,
    text: theme.palette.text.primary,
    border: theme.palette.divider
  }
});

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
        "& .MuiTypography-root": { backgroundColor: theme.palette.action.hover }
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
