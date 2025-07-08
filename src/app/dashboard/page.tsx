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
import { StoreDemo } from "@/components/StoreDemo";

interface Resume {
  id: number;
  title: string;
  content: any;
  strengths: Strength[];
  createdAt: string;
}

interface Strength {
  id: number;
  skillName: string;
  rating: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else {
        setError("Failed to load resumes");
      }
    } catch (error) {
      setError("An error occurred while loading resumes");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {session?.user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your professional resumes and track your progress
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            href="/dashboard/resumes/new"
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
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={4}>
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
                    {resumes.length > 0 ? getAverageStrengthRating(resumes.flatMap(r => r.strengths)) : 0}
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
                    {resumes.length > 0 ? resumes.flatMap(r => r.strengths).length : 0}
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
                    {resumes.filter(r => r.strengths.length > 0).length}
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
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Your First Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
            {resumes.slice(0, 6).map((resume) => (
              <Card key={resume.id} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {resume.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Created {new Date(resume.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  {resume.strengths.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Top Skills:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {resume.strengths.slice(0, 3).map((strength) => (
                          <Chip
                            key={strength.id}
                            label={`${strength.skillName} (${strength.rating}/10)`}
                            size="small"
                            color={getStrengthColor(strength.rating) as any}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box display="flex" gap={1}>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                    <Button size="small" variant="outlined">
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Zustand Store Demo */}
        <Box mt={6}>
          <StoreDemo />
        </Box>
      </Box>
    </DashboardLayout>
  );
}
