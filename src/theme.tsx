import { type Theme, createTheme } from "@mui/material";
import PoppinsRegular from "../resources/fonts/poppins/Poppins-Regular.ttf";
import PoppinsBlack from "../resources/fonts/poppins/Poppins-Black.ttf";
import PoppinsMedium from "../resources/fonts/poppins/Poppins-Medium.ttf";
import PoppinsSemiBold from "../resources/fonts/poppins/Poppins-SemiBold.ttf";
import PoppinsBold from "../resources/fonts/poppins/Poppins-Bold.ttf";
export const theme: Theme = createTheme({
  typography: {
    fontFamily: "Poppins",
    fontWeightRegular: 400,
    fontSize: 15,
    h2: {
      fontWeight: 500,
      fontSize: 45,
      fontStyle: "medium",
    },
    h3: {
      fontWeight: 700,
      fontSize: 30,
      fontStyle: "bold",
    },
    h4: {
      fontWeight: 600,
      fontSize: 20,
    },
    h6:{
      fontWeight: 700,
      fontSize: 20,
      fontStyle: "bold"
    },
    subtitle1:{
      fontWeight: 600,
      fontSize: 18,
      color: "#f9473b"
    },
    subtitle2:{
      fontWeight: 400,
      fontSize: 20,
      fontStyle: "regular"
    },
    body1:{
      fontWeight: 400,
      fontSize: 16,
      fontStyle: "regular"
    },
    body2:{
      fontWeight: 400,
      fontSize: 16,
      fontStyle: "regular",
    },
  },
  palette: {
    primary: {
      main: "#222"
    },
    secondary: {
      main: "#F47D38"
    },
    info:{
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
          borderRadius: "5px",
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "bold"
        }
      }
    },
    MuiSelect: {
    styleOverrides: {
      root: {
        backgroundColor: "#F47D38",
        color: "#fff",
        borderRadius: "10px",
        height: "45px",
        padding: "0 15px",
        "& .MuiSvgIcon-root": {
          color: "#fff",
        },
      },
    },
  },
  },
});

export const wikiScreenColors = {
  button : {
    main: "#E9E8E8",
    hover: "#DCD8D8",
    text: "#787272"
  }
}