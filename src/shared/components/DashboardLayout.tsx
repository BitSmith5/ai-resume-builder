"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Description as ResumeIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Get current page title based on pathname
  const getCurrentPageTitle = () => {
    if (pathname === "/resume") return "Resume";
    if (pathname === "/resume/new") return "Edit Resume";
    if (pathname === "/profile") return "Profile";
    return "Resume Builder";
  };



  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const menuItems = [
    { text: "Resume", icon: <ResumeIcon />, path: "/resume" }, // New menu item for Resume section
    { text: "Profile", icon: <ProfileIcon />, path: "/profile" },
  ];

  const drawer = (
    <Box component="nav" aria-label="Main navigation">
      <Toolbar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ color: 'rgb(173, 126, 233)' }}
          id="app-title"
        >
          Resume Builder
        </Typography>
      </Toolbar>
      <List 
        role="menubar" 
        aria-labelledby="app-title"
        aria-label="Resume builder navigation menu"
      >
        {menuItems.map((item) => {
          const isSelected = pathname === item.path;
          return (
            <ListItem key={item.text} role="none">
              <ListItemButton
                role="menuitem"
                aria-current={isSelected ? 'page' : undefined}
                aria-label={`Navigate to ${item.text}`}
                aria-describedby={`${item.text.toLowerCase().replace(/\s+/g, '-')}-description`}
                onClick={() => router.push(item.path)}
                sx={{
                  backgroundColor: isSelected ? 'rgb(173, 126, 233)' : 'transparent',
                  borderRadius: '30px',
                  color: isSelected ? 'white' : 'inherit',
                  '&:hover': {
                    backgroundColor: isSelected ? 'rgb(173, 126, 233)' : 'rgb(200, 200, 200)',
                  },
                  '&:focus': {
                    outline: '2px solid rgb(173, 126, 233)',
                    outlineOffset: '-2px',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ color: 'inherit' }}
                  aria-hidden="true"
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    'aria-label': `${item.text} navigation item`
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Hidden descriptions for screen readers */}
      <div id="dashboard-description" className="sr-only">
        Main dashboard where you can view and manage all your resumes.
      </div>
      <div id="resume-description" className="sr-only">
        Resume management page where you can create, edit, and organize your resumes.
      </div>
      <div id="profile-description" className="sr-only">
        Profile settings page where you can manage your personal information and account settings.
      </div>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex",
      height: "100vh",
    }}>
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
        role="banner"
        aria-label="Application header"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="navigation-drawer"
            aria-describedby="menu-toggle-description"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ flexGrow: 1 }}
            id="page-title"
          >
            {getCurrentPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="Open user menu"
              aria-describedby="user-menu-description"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'rgb(173, 126, 233)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="Navigation drawer"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          id="navigation-drawer"
          aria-labelledby="app-title"
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
          aria-labelledby="app-title"
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        id="main-content"
        role="main"
        aria-labelledby="page-title"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Account for AppBar height
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        role="menu"
        aria-label="User profile menu"
        aria-labelledby="user-menu-button"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => router.push('/profile')}
          role="menuitem"
          aria-label="Go to profile settings"
        >
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          role="menuitem"
          aria-label="Sign out of the application"
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      {/* Hidden descriptions for screen readers */}
      <div id="menu-toggle-description" className="sr-only">
        Toggles the navigation menu open and closed on mobile devices.
      </div>
      <div id="user-menu-description" className="sr-only">
        Opens a menu with user account options including profile settings and sign out.
      </div>
    </Box>
  );
} 