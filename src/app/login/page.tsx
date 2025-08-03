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
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { Google as GoogleIcon, GitHub as GitHubIcon, Visibility, VisibilityOff } from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard/resume");
    }
  }, [session, status, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError("");
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard/resume",
        redirect: false,
      });

      if (result?.error) {
        setError(`Authentication failed: ${result.error}`);
      } else if (result?.ok) {
        router.push("/dashboard/resume");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password.");
      } else if (result?.ok) {
        router.push("/dashboard/resume");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Starting registration process...");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        setError(data.error || "Registration failed.");
      } else {
        console.log("Registration successful, attempting auto-sign-in...");
        // Auto-sign in after successful registration
        const result = await signIn("credentials", {
          username: formData.username,
          password: formData.password,
          redirect: false,
        });

        console.log("Auto-sign-in result:", result);

        if (result?.ok) {
          console.log("Auto-sign-in successful, redirecting to dashboard...");
          router.push("/dashboard/resume");
        } else {
          console.error("Auto-sign-in failed:", result?.error);
          setError("Registration successful but auto-sign-in failed. Please sign in manually.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
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

          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleCredentialsSignIn} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Username or Email"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                fullWidth
                disabled={isLoading}
              />
              <FormControl fullWidth required>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  disabled={isLoading}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                Sign In
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleSignUp} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
                fullWidth
                disabled={isLoading}
              />
              <TextField
                label="Username"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                fullWidth
                disabled={isLoading}
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                required
                fullWidth
                disabled={isLoading}
              />
              <FormControl fullWidth required>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  disabled={isLoading}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                Sign Up
              </Button>
            </Box>
          </TabPanel>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or continue with
            </Typography>
          </Divider>

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