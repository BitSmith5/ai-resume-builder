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
  Stack,
  Chip,
} from "@mui/material";
import {
  Description as ResumeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Palette as DesignIcon,
  CloudDone as CloudIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { COLORS } from "@/lib/colorSystem";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard/resume");
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
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          color: "white",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" py={12}>
            <Chip 
              label="Professional Resume Builder" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                mb: 3,
                fontSize: '0.9rem',
                fontWeight: 500
              }} 
            />
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 3
              }}
            >
              Create Your Perfect Resume
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ 
                mb: 6,
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Build professional resumes that stand out with our modern templates and intuitive editor
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/login"
              startIcon={<ResumeIcon />}
              sx={{
                bgcolor: "white",
                color: COLORS.primary,
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Building
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box textAlign="center" mb={8}>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            Why Choose Our Resume Builder?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Professional tools designed to help you create resumes that get you noticed
          </Typography>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
          <Card 
            sx={{ 
              height: "100%", 
              textAlign: "center",
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: COLORS.overlay,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <DesignIcon sx={{ fontSize: 40, color: COLORS.primary }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Customizable Templates
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Start with professionally designed templates and customize every aspect to match your personal style and industry requirements.
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              height: "100%", 
              textAlign: "center",
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: COLORS.overlay,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <SpeedIcon sx={{ fontSize: 40, color: COLORS.primary }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Quick & Easy
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Our intuitive editor makes it simple to create professional resumes in minutes, not hours.
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            sx={{ 
              height: "100%", 
              textAlign: "center",
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: COLORS.overlay,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <SecurityIcon sx={{ fontSize: 40, color: COLORS.primary }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Secure & Private
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Your data is protected with enterprise-grade security. Sign in with Google or GitHub for convenience.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: COLORS.backgroundLight, py: 8 }}>
        <Container maxWidth="lg">
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} textAlign="center">
            <Box>
              <Typography variant="h3" component="div" sx={{ color: COLORS.primary, fontWeight: 700, mb: 1 }}>
                10K+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Resumes Created
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" component="div" sx={{ color: COLORS.primary, fontWeight: 700, mb: 1 }}>
                95%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Success Rate
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" component="div" sx={{ color: COLORS.primary, fontWeight: 700, mb: 1 }}>
                4.9
              </Typography>
              <Typography variant="body1" color="text.secondary">
                User Rating
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.default', py: 12 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3
              }}
            >
              Ready to Build Your Professional Resume?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 6,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              Join thousands of professionals who trust our platform to create resumes that help them land their dream jobs.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/login"
              startIcon={<ResumeIcon />}
              sx={{ 
                px: 6, 
                py: 2, 
                fontSize: "1.2rem",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: COLORS.primary,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                "&:hover": {
                  bgcolor: COLORS.primaryDark,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Building Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
