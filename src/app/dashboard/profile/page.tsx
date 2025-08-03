"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";
import { COLORS } from "@/lib/colorSystem";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  phone: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    resumeAutoSave: boolean;
    publicProfile: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    location: "",
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    phone: "",
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      resumeAutoSave: true,
      publicProfile: false,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load profile data from API
  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setProfileData(prev => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || "",
          linkedinUrl: userData.linkedinUrl || "",
          portfolioUrl: userData.portfolioUrl || "",
          githubUrl: userData.githubUrl || "",
          phone: userData.phone || "",
          preferences: userData.preferences || prev.preferences,
        }));
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));
      // Load additional profile data from API
      loadProfileData();
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          location: profileData.location,
          linkedinUrl: profileData.linkedinUrl,
          portfolioUrl: profileData.portfolioUrl,
          githubUrl: profileData.githubUrl,
          phone: profileData.phone,
          preferences: profileData.preferences,
        }),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile. Please try again.");
      }
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    // Reset to original data
    loadProfileData();
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated (DashboardLayout will handle redirect)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <DashboardLayout>
      <Box m={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: COLORS.primary }}>
              Profile Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information and preferences
            </Typography>
          </Box>
          {!isEditing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                backgroundColor: COLORS.primary,
                '&:hover': {
                  backgroundColor: COLORS.hover,
                },
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
          {/* Profile Information */}
          <Box flex={2}>
            <Card sx={{ backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <PersonIcon sx={{ mr: 1, color: COLORS.primary }} />
                  <Typography variant="h6" sx={{ color: COLORS.primary }}>
                    Personal Information
                  </Typography>
                </Box>

                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: COLORS.primary }} />,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: COLORS.primary }} />,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'inherit !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={profileData.linkedinUrl}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                    InputProps={{
                      startAdornment: <LinkedInIcon sx={{ mr: 1, color: COLORS.primary }} />,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="GitHub URL"
                    value={profileData.githubUrl}
                    onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="https://github.com/yourusername"
                    InputProps={{
                      startAdornment: <GitHubIcon sx={{ mr: 1, color: COLORS.primary }} />,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Portfolio URL"
                    value={profileData.portfolioUrl}
                    onChange={(e) => setProfileData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="https://yourportfolio.com"
                    InputProps={{
                      startAdornment: <LanguageIcon sx={{ mr: 1, color: COLORS.primary }} />,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'inherit !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    sx={{ 
                      gridColumn: { sm: "span 2" },
                      '& .MuiInputBase-input': {
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                        '&:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 100px #f5f5f5 inset !important',
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
                        },
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: COLORS.hover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                </Box>

                {isEditing && (
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        backgroundColor: COLORS.primary,
                        '&:hover': {
                          backgroundColor: COLORS.hover,
                        },
                        '&:disabled': {
                          backgroundColor: COLORS.primaryDark,
                        },
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        '&:hover': {
                          borderColor: COLORS.hover,
                          backgroundColor: COLORS.selectedBackground,
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Profile Avatar and Account Info */}
          <Box flex={1} minWidth={{ md: 300 }}>
            <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  src={session?.user?.image || undefined}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: "auto", 
                    mb: 2,
                    backgroundColor: COLORS.primary,
                  }}
                >
                  {!session?.user?.image && session?.user?.name ? session.user.name.charAt(0).toUpperCase() : undefined}
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
                  {session?.user?.name || "User"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {session?.user?.email}
                </Typography>
                <Chip 
                  label="Premium Member" 
                  sx={{ 
                    mt: 1,
                    backgroundColor: COLORS.primary,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: COLORS.hover,
                    },
                  }} 
                />
              </CardContent>
            </Card>

            {/* Preferences */}
            {/* <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <SettingsIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Preferences</Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('emailNotifications')}
                        disabled={!isEditing}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.pushNotifications}
                        onChange={() => handlePreferenceChange('pushNotifications')}
                        disabled={!isEditing}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.resumeAutoSave}
                        onChange={() => handlePreferenceChange('resumeAutoSave')}
                        disabled={!isEditing}
                      />
                    }
                    label="Auto-save Resumes"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.publicProfile}
                        onChange={() => handlePreferenceChange('publicProfile')}
                        disabled={!isEditing}
                      />
                    }
                    label="Public Profile"
                  />
                </Stack>
              </CardContent>
            </Card> */}
          </Box>
        </Box>

        {/* Account Security */}
        <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <SecurityIcon sx={{ mr: 1, color: COLORS.primary }} />
              <Typography variant="h6" sx={{ color: COLORS.primary }}>
                Account Security
              </Typography>
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: COLORS.primary }}>
                  Last Login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: COLORS.primary }}>
                  Account Created
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session?.user?.name ? "Recently" : "Unknown"}
                </Typography>
              </Box>
            </Box>

            <Box mt={3}>
              <Button 
                variant="outlined" 
                sx={{
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  '&:hover': {
                    borderColor: COLORS.hover,
                    backgroundColor: COLORS.selectedBackground,
                  },
                }}
              >
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
} 