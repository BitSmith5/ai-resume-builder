"use client";

import { useState, useEffect } from "react";
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
import { COLORS } from "@/lib/colorSystem";

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Get current page title based on pathname
  const getCurrentPageTitle = () => {
    if (pathname === "/dashboard/resume") return "Resume";
    if (pathname === "/dashboard/resume/new") return "Edit Resume";
    if (pathname === "/dashboard/profile") return "Profile";
    return "Resume Builder";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { text: "Resume", icon: <ResumeIcon />, path: "/dashboard/resume" }, // New menu item for Resume section
    { text: "Profile", icon: <ProfileIcon />, path: "/dashboard/profile" },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: COLORS.primary }}>
          Resume Builder
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => {
          const isSelected = pathname === item.path || 
                           (item.path === "/dashboard/resume" && pathname?.startsWith("/dashboard/resume"));
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => router.push(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: '20px',
                  backgroundColor: isSelected ? COLORS.selectedBackground : 'transparent',
                  color: isSelected ? COLORS.primary : 'inherit',
                  '&:hover': {
                    backgroundColor: COLORS.selectedBackground,
                    borderRadius: '20px',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isSelected ? COLORS.primary : 'inherit',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: isSelected ? 600 : 400,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'black' }}>
            {getCurrentPageTitle()}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2,
                display: { xs: 'none', sm: 'block' },
                color: 'black'
              }}
            >
              {mounted ? (session?.user?.name || "User") : "..."}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {mounted && session?.user?.image ? (
                <Avatar src={session.user.image} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32 }}>
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100vw", md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { xs: "100vw", md: "none" },
          overflow: "visible",
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => router.push("/dashboard/profile")}>
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
} 