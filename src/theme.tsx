import { createTheme, type Theme } from "@mui/material";
import PoppinsBlack from "../resources/fonts/poppins/Poppins-Black.ttf";
import PoppinsBold from "../resources/fonts/poppins/Poppins-Bold.ttf";
import PoppinsMedium from "../resources/fonts/poppins/Poppins-Medium.ttf";
import PoppinsRegular from "../resources/fonts/poppins/Poppins-Regular.ttf";
import PoppinsSemiBold from "../resources/fonts/poppins/Poppins-SemiBold.ttf";
export const theme: Theme = createTheme({
  typography: {
    fontFamily: "Poppins",
    fontWeightRegular: 400,
    fontSize: 15,
    h2: {
      fontWeight: 500,
      fontSize: 45,
      fontStyle: "medium"
    },
    h3: {
      fontWeight: 700,
      fontSize: 30,
      fontStyle: "bold"
    },
    h4: {
      fontWeight: 600,
      fontSize: 20
    },
    h6: {
      fontWeight: 700,
      fontSize: 20,
      fontStyle: "bold"
    },
    body1: {
      fontWeight: 400,
      fontSize: 16,
      fontStyle: "regular"
    },
    body2: {
      fontWeight: 400,
      fontSize: 16,
      fontStyle: "regular"
    }
  },
  palette: {
    primary: {
      main: "#222"
    },
    secondary: {
      main: "#F47D38"
    },
    info: {
      main: "#F9473B"
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
        root: {
          backgroundColor: "#f5f5f5"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5"
        }
      }
    },
    MuiChip: {
      defaultProps: {
        color: "default"
      },
      styleOverrides: {
        root: {
          backgroundColor: "#F9473B",
          color: "#ffffff",
          fontWeight: "600",
          borderRadius: "5px"
        }
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

export const wikiScreenColors = {
  button: {
    main: "#E9E8E8",
    hover: "#DCD8D8",
    text: "#787272"
  }
};

export const customTheme = {
  ...theme,
  customStyles: {
    listViewTypography: {
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      px: 3,
      py: 2,
      fontWeight: "bold",
      color: "black",
      display: "inline-block",
      textAlign: "center",
      pointerEvents: "none"
    },
    listViewButton: {
      textTransform: "none",
      padding: 0,
      minWidth: "unset",
      borderRadius: 4,
      boxShadow: "0 0 0 2px black",
      lineHeight: 0,
      backgroundColor: "transparent",
      mx: 1.5,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "box-shadow 0.2s ease",
      "&:hover": {
        boxShadow: "0 0 0 3px black",
        "& .MuiTypography-root": { backgroundColor: "#c7c7c7" }
      },
      "&.Mui-disabled": {
        boxShadow: "0 0 0 2px #9e9e9e",
        "& .MuiTypography-root": { backgroundColor: "#f0f0f0", color: "#9e9e9e" }
      }
    }
  }
};
