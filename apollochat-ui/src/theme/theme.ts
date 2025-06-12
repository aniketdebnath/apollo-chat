import { createTheme, alpha } from "@mui/material/styles";

// Define color constants
const PRIMARY = {
  main: "#6C63FF", // Vibrant purple
  light: "#9D97FF",
  dark: "#4B44CB",
  contrastText: "#FFFFFF",
};

const SECONDARY = {
  main: "#FF6584", // Coral pink
  light: "#FF8FA6",
  dark: "#D53C65",
  contrastText: "#FFFFFF",
};

const SUCCESS = {
  main: "#00B8A9",
  light: "#4DCDC2",
  dark: "#008F82",
  contrastText: "#FFFFFF",
};

const INFO = {
  main: "#0084FF",
  light: "#339DFF",
  dark: "#0069CB",
  contrastText: "#FFFFFF",
};

const WARNING = {
  main: "#FFAF20",
  light: "#FFC14D",
  dark: "#CC8C19",
  contrastText: "#FFFFFF",
};

const ERROR = {
  main: "#F44336",
  light: "#F6695E",
  dark: "#C3352B",
  contrastText: "#FFFFFF",
};

// Create the custom theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: PRIMARY,
    secondary: SECONDARY,
    success: SUCCESS,
    info: INFO,
    warning: WARNING,
    error: ERROR,
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          backgroundImage: "linear-gradient(to right, #1A1A1A, #2D2D2D)",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px 0 rgba(108, 99, 255, 0.2)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 8px 16px 0 rgba(108, 99, 255, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.2)",
          backgroundImage:
            "linear-gradient(to bottom, rgba(35,35,35,1), rgba(30,30,30,1))",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 10px 0 rgba(0,0,0,0.2)",
        },
        elevation2: {
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.25)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2px solid ${alpha(PRIMARY.main, 0.3)}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 0",
          "&.Mui-selected": {
            backgroundColor: alpha(PRIMARY.main, 0.15),
            "&:hover": {
              backgroundColor: alpha(PRIMARY.main, 0.25),
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.1)",
        },
      },
    },
  },
});

export default darkTheme;
