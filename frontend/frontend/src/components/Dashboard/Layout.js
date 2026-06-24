import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Menu, MenuItem, Divider, Tooltip, Badge
} from '@mui/material';
import {
  Dashboard, FolderOpen, Assignment, Group, BarChart,
  Menu as MenuIcon, Logout, Person, Assignment as Logo
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Projects', icon: <FolderOpen />, path: '/projects' },
  { label: 'Tasks', icon: <Assignment />, path: '/tasks' },
  { label: 'Team', icon: <Group />, path: '/team' },
  { label: 'Reports', icon: <BarChart />, path: '/reports' },
];

const Layout = ({ children }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Logo sx={{ color: 'primary.main', fontSize: 30 }} />
        <Typography variant="h6" fontWeight={700} color="primary">PMS</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                mx: 1, borderRadius: 2,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
                '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">Logged in as</Typography>
        <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user?.role}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {navItems.find(n => n.path === location.pathname)?.label || 'Project Management'}
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
              <Person fontSize="small" sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
