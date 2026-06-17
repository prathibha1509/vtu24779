import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Dashboard from "./pages/Dashboard.jsx";

// Create a premium, harmonious dark mode theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0a0e17", // deep space dark blue
      paper: "#121824",   // slate dark card background
    },
    primary: {
      main: "#4d7cff",    // electric tech blue
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0",    // purple highlight
    },
    error: {
      main: "#ff4d4d",    // soft red
    },
    warning: {
      main: "#ffb300",    // soft amber
    },
    info: {
      main: "#00e5ff",     // vibrant cyan
    },
    success: {
      main: "#00e676",    // rich green
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 800,
    },
    h2: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    button: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.2)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 30px 0 rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(77, 124, 255, 0.2)",
          },
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  );
}