"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
} from "@mui/material";

import {
  Add as AddIcon,
  Description as ResumeIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
// import { StoreDemo } from "@/components/StoreDemo";

interface Resume {
  id: number;
  title: string;
  content: unknown;
  strengths: Strength[];
  createdAt: string;
}

interface Strength {
  id: number;
  skillName: string;
  rating: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Dashboard mounted, status:", status, "session:", session);
  }, [status, session]);

  useEffect(() => {
    console.log("Status changed:", status, "session:", session);
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status, session]);

  const fetchResumes = async () => {
    try {
      console.log("Fetching resumes...");
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        console.log("Resumes fetched:", data);
        setResumes(data);
      } else {
        console.error("Failed to load resumes:", response.status);
        setError("Failed to load resumes");
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setError("An error occurred while loading resumes");
    }
  };

  const getAverageStrengthRating = (strengths: Strength[]) => {
    if (strengths.length === 0) return 0;
    const total = strengths.reduce((sum, strength) => sum + strength.rating, 0);
    return Math.round(total / strengths.length);
  };

  const getStrengthColor = (rating: number) => {
    if (rating >= 8) return "success";
    if (rating >= 6) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return "Loading...";
    try {
      const date = new Date(dateString);
      // Use a consistent format that doesn't depend on locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return 'Unknown';
    }
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <DashboardLayout>
        <Box sx={{ width: "100%", p: 4 }}>
          <Typography variant="h6" gutterBottom>Loading...</Typography>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated (DashboardLayout will handle redirect)
  if (status === "unauthenticated") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Not authenticated. Redirecting...</Typography>
      </Box>
    );
  }

  // Fallback for any other status
  if (status !== "authenticated") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Unexpected status: {status}</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <Box m={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome back, {mounted ? session?.user?.name : "..."}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your professional resumes and track your progress
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              href="/dashboard/resume/new"
            >
              Create New Resume
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={4} mt={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <ResumeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {resumes.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Resumes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {resumes.length > 0 ? getAverageStrengthRating(resumes.flatMap((r: Resume) => r.strengths)) : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Strength Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {resumes.length > 0 ? resumes.flatMap((r: Resume) => r.strengths).length : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Skills Tracked
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                    <ResumeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {resumes.filter((r: Resume) => r.strengths.length > 0).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resumes with Skills
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Resumes */}
          <Typography variant="h5" component="h2" gutterBottom>
            Recent Resumes
          </Typography>

          {resumes.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <ResumeIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No resumes yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Create your first professional resume to get started
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} href="/dashboard/resume/new">
                  Create Your First Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
              {resumes.slice(0, 6).map((resume: Resume) => (
                <Card key={resume.id} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {resume.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Created {resume.createdAt ? formatDate(resume.createdAt) : 'Unknown'}
                    </Typography>
                    
                    {resume.strengths.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Top Skills:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {resume.strengths.slice(0, 3).map((strength: Strength) => (
                            <Chip
                              key={strength.id}
                              label={`${strength.skillName} (${strength.rating}/10)`}
                              size="small"
                              color={getStrengthColor(strength.rating) as "success" | "warning" | "error"}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                                         <Box display="flex" gap={1}>
                       <Button size="small" variant="outlined" href={`/dashboard/resume/new?id=${resume.id}`}>
                         View
                       </Button>
                       <Button size="small" variant="outlined" href={`/dashboard/resume/new?id=${resume.id}`}>
                         Edit
                       </Button>
                     </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </DashboardLayout>
    </ErrorBoundary>
  );
}
