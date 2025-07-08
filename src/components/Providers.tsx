"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalNotifications } from "./GlobalNotifications";
import { AuthSyncProvider } from "./AuthSyncProvider";

interface ProvidersProps {
  children: ReactNode;
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)",
  },
});

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <AuthSyncProvider>
          {children}
          <GlobalNotifications />
        </AuthSyncProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 