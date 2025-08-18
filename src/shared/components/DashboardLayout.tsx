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
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'rgb(173, 126, 233)' }}>
          Resume Builder
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => {
          const isSelected = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  backgroundColor: isSelected ? '#fafafa' : 'transparent',
                  color: isSelected ? 'rgb(173, 126, 233)' : 'inherit',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex",
      height: "100vh", // Ensure full viewport height
      overflow: "hidden" // Prevent unnecessary scroll bars
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "white",
          color: "black",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPageTitle()}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
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

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
          p: 0, // Remove padding to allow content to extend to edges
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          height: "calc(100vh - 64px)", // Ensure main content fits within viewport
          overflow: "hidden", // Prevent scrolling at this level
          display: "flex",
          flexDirection: "column"
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 150,
            mt: 1,
          },
        }}
      >
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