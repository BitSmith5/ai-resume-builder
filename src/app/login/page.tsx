"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    
    if (status === "authenticated" && session) {
      console.log("User is authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Starting sign in with:", provider);
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError(`Authentication failed: ${result.error}`);
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography>Loading...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Don't show login form if already authenticated
  if (status === "authenticated") {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography>Redirecting to dashboard...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to AI Resume Builder
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to create and manage your professional resumes
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => handleSignIn("google")}
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderColor: "#4285f4",
                color: "#4285f4",
                "&:hover": {
                  borderColor: "#3367d6",
                  backgroundColor: "rgba(66, 133, 244, 0.04)",
                },
              }}
            >
              Continue with Google
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              size="large"
              startIcon={<GitHubIcon />}
              onClick={() => handleSignIn("github")}
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderColor: "#24292e",
                color: "#24292e",
                "&:hover": {
                  borderColor: "#000",
                  backgroundColor: "rgba(36, 41, 46, 0.04)",
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 