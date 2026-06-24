import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, MenuItem, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Assignment } from '@mui/icons-material';
import { register } from '../../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await register(formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Assignment sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700} mt={1}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join the Project Management System</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required margin="normal" />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required margin="normal" />
            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange}
              required margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField select fullWidth label="Role" name="role" value={formData.role} onChange={handleChange} margin="normal">
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            <Typography variant="body2" textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
