"use client";

import { useSession } from "next-auth/react";
import { Box, Typography, Paper } from "@mui/material";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: "grey.100" }}>
      <Typography variant="h6" gutterBottom>
        Session Debug (Development Only)
      </Typography>
      <Box>
        <Typography variant="body2">
          <strong>Status:</strong> {status}
        </Typography>
        <Typography variant="body2">
          <strong>Authenticated:</strong> {status === "authenticated" ? "Yes" : "No"}
        </Typography>
        <Typography variant="body2">
          <strong>User ID:</strong> {(session?.user as { id?: string })?.id || "Not set"}
        </Typography>
        <Typography variant="body2">
          <strong>User Name:</strong> {session?.user?.name || "Not set"}
        </Typography>
        <Typography variant="body2">
          <strong>User Email:</strong> {session?.user?.email || "Not set"}
        </Typography>
        <Typography variant="body2">
          <strong>Username:</strong> {(session?.user as { username?: string })?.username || "Not set"}
        </Typography>
      </Box>
    </Paper>
  );
} 