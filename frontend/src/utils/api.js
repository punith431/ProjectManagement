import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/profile');

// Projects
export const getProjects = () => API.get('/projects');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks${projectId ? `?project_id=${projectId}` : ''}`);
export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Team
export const getUsers = () => API.get('/team/users');
export const getProjectMembers = (projectId) => API.get(`/team/project/${projectId}/members`);
export const addProjectMember = (data) => API.post('/team/project/member', data);
export const removeProjectMember = (projectId, userId) => API.delete(`/team/project/${projectId}/member/${userId}`);
export const updateUserRole = (id, data) => API.put(`/team/users/${id}/role`, data);

// Reports
export const getDashboardStats = () => API.get('/reports/dashboard');
export const getProjectReport = (id) => API.get(`/reports/project/${id}`);
