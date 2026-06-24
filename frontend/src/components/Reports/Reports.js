import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert,
  Grid, MenuItem, TextField, Chip, Divider, LinearProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboardStats, getProjectReport, getProjects } from '../../utils/api';

const COLORS = ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectReport, setProjectReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([getDashboardStats(), getProjects()]);
        setStats(statsRes.data);
        setProjects(projectsRes.data);
      } catch { setError('Failed to load reports.'); }
      finally { setLoading(false); }
    };
    fetchInitial();
  }, []);

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    if (!projectId) { setProjectReport(null); return; }
    setReportLoading(true);
    try {
      const res = await getProjectReport(projectId);
      setProjectReport(res.data);
    } catch { setError('Failed to load project report.'); }
    finally { setReportLoading(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Reports & Analytics</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Task Distribution by Status</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.tasksByStatus || []}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(stats?.tasksByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Summary</Typography>
              {[
                { label: 'Total Projects', value: stats?.stats.total_projects },
                { label: 'Active Projects', value: stats?.stats.active_projects },
                { label: 'Total Tasks', value: stats?.stats.total_tasks },
                { label: 'Completed Tasks', value: stats?.stats.completed_tasks },
                { label: 'Total Users', value: stats?.stats.total_users },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                </Box>
              ))}
              {stats?.stats.total_tasks > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Completion Rate</Typography>
                    <Typography variant="caption" fontWeight={700}>
                      {Math.round((stats.stats.completed_tasks / stats.stats.total_tasks) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={Math.round((stats.stats.completed_tasks / stats.stats.total_tasks) * 100)} sx={{ height: 8, borderRadius: 2 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Project Report</Typography>
          <TextField select fullWidth label="Select Project" value={selectedProject} onChange={(e) => handleProjectSelect(e.target.value)} sx={{ mb: 3 }}>
            <MenuItem value="">— Select a project —</MenuItem>
            {projects.map((p) => <MenuItem key={p.project_id} value={p.project_id}>{p.project_name}</MenuItem>)}
          </TextField>

          {reportLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>}

          {projectReport && !reportLoading && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{projectReport.project.project_name}</Typography>
              <Chip label={projectReport.project.status} size="small" sx={{ mb: 2 }} />

              <Typography variant="subtitle2" fontWeight={600} mt={2} mb={1}>Task Stats by Status & Priority</Typography>
              <Grid container spacing={1} mb={3}>
                {projectReport.taskStats.map((ts, i) => (
                  <Grid item key={i}>
                    <Chip label={`${ts.status} / ${ts.priority}: ${ts.count}`} size="small" variant="outlined" />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} mb={1}>Team Performance</Typography>
              {projectReport.members.map((m) => (
                <Box key={m.email} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f5f5f5' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption">{m.completed_tasks}/{m.assigned_tasks} tasks completed</Typography>
                    {m.assigned_tasks > 0 && (
                      <LinearProgress variant="determinate" value={Math.round((m.completed_tasks / m.assigned_tasks) * 100)} sx={{ width: 100, height: 4, borderRadius: 2, mt: 0.5 }} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
