import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Grid, IconButton, Tooltip, FormControl, InputLabel, Select
} from '@mui/material';
import { Add, Edit, Delete, FilterList } from '@mui/icons-material';
import { getTasks, createTask, updateTask, deleteTask, getProjects, getUsers } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PRIORITY_COLOR = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#9c27b0' };
const STATUS_COLOR = { todo: 'default', in_progress: 'info', review: 'warning', completed: 'success' };

const defaultForm = { project_id: '', task_name: '', description: '', assigned_to: '', priority: 'medium', status: 'todo', due_date: '' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const { user } = useAuth();

  const fetchAll = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditTask(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({ project_id: t.project_id, task_name: t.task_name, description: t.description || '', assigned_to: t.assigned_to || '', priority: t.priority, status: t.status, due_date: t.due_date?.split('T')[0] || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTask) await updateTask(editTask.task_id, form);
      else await createTask(form);
      setDialogOpen(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(id); fetchAll(); }
    catch { setError('Delete failed.'); }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Tasks</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>New Task</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterList color="action" />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select value={filterStatus} label="Filter Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {['todo', 'in_progress', 'review', 'completed'].map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filter Priority</InputLabel>
            <Select value={filterPriority} label="Filter Priority" onChange={(e) => setFilterPriority(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {['low', 'medium', 'high', 'critical'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">{filteredTasks.length} task(s)</Typography>
        </Box>
      </Card>

      {filteredTasks.length === 0 ? (
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No tasks found.</Typography>
        </Card>
      ) : filteredTasks.map((t) => (
        <Card key={t.task_id} sx={{ mb: 1.5, borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600}>{t.task_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.project_name} · Assigned to: {t.assigned_to_name || 'Unassigned'} · Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={t.priority} size="small" sx={{ bgcolor: PRIORITY_COLOR[t.priority] + '20', color: PRIORITY_COLOR[t.priority], fontWeight: 600 }} />
                <Chip label={t.status.replace('_', ' ')} size="small" color={STATUS_COLOR[t.status] || 'default'} />
                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(t)}><Edit fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(t.task_id)}><Delete fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Project" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} required margin="normal">
            {projects.map((p) => <MenuItem key={p.project_id} value={p.project_id}>{p.project_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Task Name" value={form.task_name} onChange={(e) => setForm({ ...form, task_name: e.target.value })} required margin="normal" />
          <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} margin="normal" />
          <TextField select fullWidth label="Assign To" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} margin="normal">
            <MenuItem value="">Unassigned</MenuItem>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField select fullWidth label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} margin="normal">
                {['low', 'medium', 'high', 'critical'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} margin="normal">
                {['todo', 'in_progress', 'review', 'completed'].map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <TextField fullWidth label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.task_name || !form.project_id}>
            {saving ? <CircularProgress size={20} /> : editTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
