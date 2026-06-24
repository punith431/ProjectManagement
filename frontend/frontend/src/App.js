import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Dashboard/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Projects from './components/Projects/Projects';
import ProjectDetail from './components/Projects/ProjectDetail';
import Tasks from './components/Tasks/Tasks';
import Team from './components/Team/Team';
import Reports from './components/Reports/Reports';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f0f2f5' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout><Projects /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <Layout><ProjectDetail /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout><Tasks /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Layout><Team /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout><Reports /></Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
