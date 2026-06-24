import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, Grid, Tabs, Tab,
  CircularProgress, Alert, Button, LinearProgress, Avatar, AvatarGroup, Tooltip
} from '@mui/material';
import { ArrowBack, FolderOpen } from '@mui/icons-material';
import { getProject } from '../../utils/api';

const STATUS_COLOR = { planning: 'default', active: 'success', on_hold: 'warning', completed: 'primary', cancelled: 'error' };
const PRIORITY_COLOR = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#9c27b0' };
const TASK_STATUS_COLOR = { todo: 'default', in_progress: 'info', review: 'warning', completed: 'success' };

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProject(id);
        setProject(res.data);
      } catch { setError('Failed to load project.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return null;

  const progress = project.tasks?.length > 0
    ? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)
    : 0;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>Back to Projects</Button>

      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FolderOpen color="primary" />
                <Typography variant="h5" fontWeight={700}>{project.project_name}</Typography>
                <Chip label={project.status} size="small" color={STATUS_COLOR[project.status] || 'default'} />
              </Box>
              <Typography color="text.secondary" mb={2}>{project.description || 'No description provided.'}</Typography>
              <Grid container spacing={3}>
                <Grid item>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption" color="text.secondary">Created By</Typography>
                  <Typography variant="body2" fontWeight={600}>{project.created_by_name}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Overall Progress</Typography>
                <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 2, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {project.tasks?.filter(t => t.status === 'completed').length}/{project.tasks?.length} tasks completed
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Tasks (${project.tasks?.length || 0})`} />
        <Tab label={`Team (${project.members?.length || 0})`} />
      </Tabs>

      {tab === 0 && (
        <Box>
          {project.tasks?.length === 0 ? (
            <Card sx={{ borderRadius: 3, textAlign: 'center', py: 4 }}><Typography color="text.secondary">No tasks yet.</Typography></Card>
          ) : project.tasks?.map((task) => (
            <Card key={task.task_id} sx={{ mb: 1.5, borderRadius: 2, boxShadow: 1 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>{task.task_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to: {task.assigned_to_name || 'Unassigned'} · Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={task.priority} size="small" sx={{ bgcolor: PRIORITY_COLOR[task.priority] + '20', color: PRIORITY_COLOR[task.priority], fontWeight: 600 }} />
                    <Chip label={task.status.replace('_', ' ')} size="small" color={TASK_STATUS_COLOR[task.status] || 'default'} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {project.members?.length === 0 ? (
            <Card sx={{ borderRadius: 3, textAlign: 'center', py: 4 }}><Typography color="text.secondary">No team members yet.</Typography></Card>
          ) : (
            <Grid container spacing={2}>
              {project.members?.map((m) => (
                <Grid item xs={12} sm={6} md={4} key={m.user_id}>
                  <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{m.name?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                        <Box><Chip label={m.role} size="small" variant="outlined" sx={{ mt: 0.5 }} /></Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetail;
