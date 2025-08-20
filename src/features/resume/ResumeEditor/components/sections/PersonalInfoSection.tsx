import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
} from '@mui/icons-material';
// Removed unused import: formatPhoneNumber
import { ProfileData } from '../../types';

interface PersonalInfoSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profileData,
  setProfileData,
}) => {
  const hasProfileData = profileData.name || profileData.email || profileData.phone || profileData.location || profileData.linkedinUrl || profileData.githubUrl || profileData.portfolioUrl;
  
  if (!hasProfileData) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Profile Information Required
          </Typography>
          <Typography variant="body2">
            To display your contact information in this resume, please complete your profile details in the Profile section. 
            Navigate to Dashboard → Profile to add your phone number, location, and professional links.
          </Typography>
        </Alert>
        <Typography variant="h5" fontWeight={700} mb={2} sx={{ fontSize: '1.5rem' }}>
          {profileData.name || "Your Name"}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 3, flexWrap: "wrap" }}>
          {profileData.email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{profileData.email}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      component="section" 
      aria-labelledby="personal-info-header"
      sx={{ py: 2 }}
    >
      {/* Name */}
      <Typography 
        id="personal-info-header"
        variant="h5" 
        fontWeight={700} 
        mb={2} 
        sx={{ fontSize: '1.5rem' }}
        component="h1"
      >
        {profileData.name || "Your Name"}
      </Typography>
      
      {/* Contact Information and Links Grid */}
      <Box 
        sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3, maxWidth: '900px' }}
        role="region"
        aria-label="Contact information and professional links"
      >
        {/* Email Column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            <EmailIcon fontSize="small" color="action" aria-hidden="true" />
            <Typography variant="body2">{profileData.email || "Email"}</Typography>
          </Box>
          <Box sx={{
            bgcolor: '#f5f5f5', 
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {/* LinkedIn */}
            <Box sx={{ 
              display: "flex",
              direction: "row",
              alignItems: "center", 
              gap: 0.3, 
              p: 1,
            }}>
              <LinkedInIcon fontSize="small" aria-hidden="true" />
              <Typography variant="body2" fontWeight={500}>LinkedIn</Typography>
            </Box>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1, 
              borderBottom: '1px solid #e0e0e0',
            }}/>
            <Box sx={{ p: 1 }}>
              <TextField
                size="small"
                value={profileData.linkedinUrl || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                variant="standard"
                aria-label="LinkedIn profile URL"
                aria-describedby="linkedin-help"
                inputProps={{
                  'aria-label': 'LinkedIn profile URL',
                  'aria-describedby': 'linkedin-help'
                }}
                sx={{ width: '100%' }}
                InputProps={{
                  disableUnderline: true
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Phone Column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            <PhoneIcon fontSize="small" color="action" aria-hidden="true" />
            <Typography variant="body2">{profileData.phone || "Phone"}</Typography>
          </Box>
          <Box sx={{
            bgcolor: '#f5f5f5', 
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {/* GitHub */}
            <Box sx={{ 
              display: "flex",
              direction: "row",
              alignItems: "center", 
              gap: 0.3, 
              p: 1,
            }}>
              <GitHubIcon fontSize="small" aria-hidden="true" />
              <Typography variant="body2" fontWeight={500}>GitHub</Typography>
            </Box>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1, 
              borderBottom: '1px solid #e0e0e0',
            }}/>
            <Box sx={{ p: 1 }}>
              <TextField
                size="small"
                value={profileData.githubUrl || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/yourusername"
                variant="standard"
                aria-label="GitHub profile URL"
                aria-describedby="github-help"
                inputProps={{
                  'aria-label': 'GitHub profile URL',
                  'aria-describedby': 'github-help'
                }}
                sx={{ width: '100%' }}
                InputProps={{
                  disableUnderline: true
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Location Column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            <LocationIcon fontSize="small" color="action" aria-hidden="true" />
            <Typography variant="body2">{profileData.location || "Location"}</Typography>
          </Box>
          <Box sx={{
            bgcolor: '#f5f5f5', 
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {/* Portfolio/Website */}
            <Box sx={{ 
              display: "flex",
              direction: "row",
              alignItems: "center", 
              gap: 0.3, 
              p: 1,
            }}>
              <WebsiteIcon fontSize="small" aria-hidden="true" />
              <Typography variant="body2" fontWeight={500}>Portfolio</Typography>
            </Box>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1, 
              borderBottom: '1px solid #e0e0e0',
            }}/>
            <Box sx={{ p: 1 }}>
              <TextField
                size="small"
                value={profileData.portfolioUrl || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                placeholder="https://yourportfolio.com"
                variant="standard"
                aria-label="Portfolio or website URL"
                aria-describedby="portfolio-help"
                inputProps={{
                  'aria-label': 'Portfolio or website URL',
                  'aria-describedby': 'portfolio-help'
                }}
                sx={{ width: '100%' }}
                InputProps={{
                  disableUnderline: true
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hidden descriptions for screen readers */}
      <div id="linkedin-help" className="sr-only">
        Enter your LinkedIn profile URL to help recruiters find your professional profile.
      </div>
      <div id="github-help" className="sr-only">
        Enter your GitHub profile URL to showcase your code repositories and projects.
      </div>
      <div id="portfolio-help" className="sr-only">
        Enter your personal portfolio or website URL to showcase your work and projects.
      </div>
    </Box>
  );
};
