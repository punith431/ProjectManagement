import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Grid, Chip, CircularProgress,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import { PersonAdd, Edit } from '@mui/icons-material';
import { getUsers, updateUserRole } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLOR = { admin: 'error', manager: 'warning', member: 'default' };

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch { setError('Failed to load team.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u) => { setEditUser(u); setNewRole(u.role); };

  const handleRoleUpdate = async () => {
    setSaving(true);
    try {
      await updateUserRole(editUser.id, { role: newRole });
      setEditUser(null);
      fetchUsers();
    } catch { setError('Failed to update role.'); }
    finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Team Members</Typography>
        <Typography variant="body2" color="text.secondary">{users.length} member(s)</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {users.map((u) => (
          <Grid item xs={12} sm={6} md={4} key={u.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50, fontSize: 20 }}>
                  {u.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={600}>{u.name}</Typography>
                    {user?.role === 'admin' && u.id !== user?.id && (
                      <Tooltip title="Edit Role">
                        <IconButton size="small" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">{u.email}</Typography>
                  <Chip label={u.role} size="small" color={ROLE_COLOR[u.role] || 'default'} sx={{ mt: 0.5, textTransform: 'capitalize' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Role — {editUser?.name}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} margin="normal">
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleUpdate} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
