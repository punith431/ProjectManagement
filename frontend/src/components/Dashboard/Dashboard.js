import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  FolderOpen, Assignment, Group, CheckCircle, TrendingUp
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboardStats } from '../../utils/api';

const COLORS = ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ bgcolor: `${color}20`, p: 1.5, borderRadius: 2 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const STATUS_COLORS = { todo: '#2196f3', in_progress: '#ff9800', review: '#9c27b0', completed: '#4caf50' };
const PRIORITY_COLORS = { low: '#4caf50', medium: '#ff9800', high: '#f44336', critical: '#9c27b0' };

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard Overview</Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Projects" value={data.stats.total_projects} icon={<FolderOpen />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Projects" value={data.stats.active_projects} icon={<TrendingUp />} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Tasks" value={data.stats.total_tasks} icon={<Assignment />} color="#9c27b0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Tasks" value={data.stats.completed_tasks} icon={<CheckCircle />} color="#4caf50" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Tasks by Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.tasksByStatus}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.tasksByStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Projects by Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.projectsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {data.projectsByStatus.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Projects</Typography>
              {data.recentProjects.length === 0 ? (
                <Typography color="text.secondary">No projects yet.</Typography>
              ) : data.recentProjects.map((p) => (
                <Box key={p.project_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{p.project_name}</Typography>
                    <Typography variant="caption" color="text.secondary">by {p.created_by_name}</Typography>
                  </Box>
                  <Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : p.status === 'completed' ? 'primary' : 'default'} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Tasks</Typography>
              {data.recentTasks.length === 0 ? (
                <Typography color="text.secondary">No tasks yet.</Typography>
              ) : data.recentTasks.map((t) => (
                <Box key={t.task_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{t.task_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.project_name} · {t.assigned_to_name || 'Unassigned'}</Typography>
                  </Box>
                  <Chip label={t.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[t.priority] + '20', color: PRIORITY_COLORS[t.priority], fontWeight: 600 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
