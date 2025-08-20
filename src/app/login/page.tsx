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
import { useNotificationActions } from "@/hooks";


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
  const { showError, showSuccess } = useNotificationActions();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/resume");
    }
  }, [session, status, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        callbackUrl: "/resume",
        redirect: false,
      });

      if (result?.error) {
        showError(`Authentication failed: ${result.error}`);
      } else if (result?.ok) {
        router.push("/resume");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      showError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        showError("Invalid username or password.");
      } else if (result?.ok) {
        router.push("/resume");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Registration successful! Please sign in.");
        setTabValue(0); // Switch to login tab
        setFormData({ username: "", email: "", password: "", name: "" });
      } else {
        showError(data.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showError("An unexpected error occurred. Please try again.");
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
    <Container maxWidth="sm" sx={{ mt: 8, pb: 4 }}>
      <Card elevation={8}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'rgb(173, 126, 233)' }}>
              Welcome to AI Resume Builder
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to create and manage your professional resumes
            </Typography>
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered 
            sx={{ 
              mb: 2,
              '& .MuiTab-root': {
                color: 'rgb(173, 126, 233)',
                '&.Mui-selected': {
                  color: 'rgb(143, 96, 203)',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'rgb(173, 126, 233)',
              },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleLogin} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Username or Email"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                fullWidth
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  },
                }}
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
                        sx={{ color: 'rgb(173, 126, 233)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  sx={{
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  }}
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  backgroundColor: 'rgb(173, 126, 233)',
                  '&:hover': {
                    backgroundColor: 'rgb(193, 146, 253)',
                  },
                  '&:disabled': {
                    backgroundColor: '#fafafa',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleRegister} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
                fullWidth
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  },
                }}
              />
              <TextField
                label="Username"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                fullWidth
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  },
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                required
                fullWidth
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  },
                }}
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
                        sx={{ color: 'rgb(173, 126, 233)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  sx={{
                    '& fieldset': {
                      borderColor: 'rgb(173, 126, 233)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(193, 146, 253)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(143, 96, 203)',
                    },
                  }}
                />
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  backgroundColor: 'rgb(173, 126, 233)',
                  '&:hover': {
                    backgroundColor: 'rgb(193, 146, 253)',
                  },
                  '&:disabled': {
                    backgroundColor: '#fafafa',
                  },
                }}
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