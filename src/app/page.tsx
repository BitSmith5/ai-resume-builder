"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import {
  Description as ResumeIcon,
  AutoAwesome as AIIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect to dashboard
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" py={8}>
            <Typography variant="h2" component="h1" gutterBottom>
              AI Resume Builder
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              Create professional resumes with AI assistance
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/login"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose AI Resume Builder?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Professional resumes created with the power of artificial intelligence
        </Typography>

        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <AIIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                AI-Powered
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Leverage advanced AI to create compelling resumes that stand out
                to employers and ATS systems.
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <SpeedIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Fast & Easy
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create professional resumes in minutes, not hours. Our
                streamlined process saves you time.
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <SecurityIcon
                sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h5" component="h3" gutterBottom>
                Secure
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your data is protected with enterprise-grade security. Sign in
                with Google or GitHub for added convenience.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Build Your Professional Resume?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of professionals who trust AI Resume Builder to
              create their next career move.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/login"
              startIcon={<ResumeIcon />}
              sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
            >
              Start Building Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
