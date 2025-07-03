import { type Theme, createTheme } from "@mui/material";
import NunitoSans from "../resources/fonts/NunitoSans.ttf";

export const theme: Theme = createTheme({
  typography: {
    fontFamily: "Nunito Sans",
    fontWeightRegular: 400,
    fontSize: 15
  },
  palette: {
    primary: {
      main: "#222"
    },
    secondary: {
      main: "#f78da7"
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Nunito Sans';
          src: local('NunitoSans'), url(${NunitoSans}) format('truetype');
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
          backgroundColor: "#F9A0A0"
        }
      }
    }
  },
  shape: {
    borderRadius: 15
  }
});

export const wikiScreenColors = {
  button : {
    main: "#E9E8E8",
    hover: "#DCD8D8",
    text: "#787272"
  }
}