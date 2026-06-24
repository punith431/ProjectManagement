import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  CircularProgress, Alert, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, LinearProgress, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { getProjects, createProject, updateProject, deleteProject } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR = { planning: 'default', active: 'success', on_hold: 'warning', completed: 'primary', cancelled: 'error' };

const defaultForm = { project_name: '', description: '', start_date: '', end_date: '', status: 'planning' };

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManage = ['admin', 'manager'].includes(user?.role);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch { setError('Failed to load projects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => { setEditProject(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (p) => { setEditProject(p); setForm({ project_name: p.project_name, description: p.description || '', start_date: p.start_date?.split('T')[0] || '', end_date: p.end_date?.split('T')[0] || '', status: p.status }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProject) await updateProject(editProject.project_id, form);
      else await createProject(form);
      setDialogOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await deleteProject(id); fetchProjects(); }
    catch { setError('Delete failed.'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Projects</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>
            New Project
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {projects.length === 0 ? (
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No projects found. Create your first project!</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((p) => {
            const progress = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={p.project_id}>
                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1, mr: 1 }}>{p.project_name}</Typography>
                      <Chip label={p.status} size="small" color={STATUS_COLOR[p.status] || 'default'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {p.description || 'No description.'}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Progress</Typography>
                        <Typography variant="caption" fontWeight={600}>{progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 6 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {p.completed_tasks}/{p.total_tasks} tasks · Due: {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pt: 0, gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/projects/${p.project_id}`)}><Visibility fontSize="small" /></IconButton>
                    </Tooltip>
                    {canManage && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(p.project_id)}><Delete fontSize="small" /></IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editProject ? 'Edit Project' : 'New Project'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Project Name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required margin="normal" />
          <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} margin="normal" />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" />
            </Grid>
          </Grid>
          <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} margin="normal">
            {['planning', 'active', 'on_hold', 'completed', 'cancelled'].map((s) => (
              <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.project_name}>
            {saving ? <CircularProgress size={20} /> : editProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
