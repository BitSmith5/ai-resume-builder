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
  Divider,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
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
    website: "",
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

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
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
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  };

  const handlePreferenceChange = (key: keyof ProfileData['preferences']) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
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
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
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
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>

                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                    sx={{ gridColumn: { sm: "span 2" } }}
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
                    sx={{ gridColumn: { sm: "span 2" } }}
                  />
                </Box>

                {isEditing && (
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
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
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  src={session?.user?.image || undefined}
                  sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {session?.user?.name || "User"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {session?.user?.email}
                </Typography>
                <Chip label="Premium Member" color="primary" size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
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
            </Card>
          </Box>
        </Box>

        {/* Account Security */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Account Security</Typography>
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Last Login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Account Created
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session?.user?.name ? "Recently" : "Unknown"}
                </Typography>
              </Box>
            </Box>

            <Box mt={3}>
              <Button variant="outlined" color="warning">
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
} 