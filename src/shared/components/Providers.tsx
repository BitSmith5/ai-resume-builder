"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalNotifications } from "./GlobalNotifications";
import { AuthSyncProvider } from "./AuthSyncProvider";
import { theme } from "@/lib/theme";

interface ProvidersProps {
  children: ReactNode;
}

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