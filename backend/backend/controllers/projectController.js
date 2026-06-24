const db = require('../config/db');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'completed') AS completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

// Get single project
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await db.query(`
      SELECT p.*, u.name AS created_by_name FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.project_id = ?`, [id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const [members] = await db.query(`
      SELECT pm.*, u.name, u.email, u.role AS user_role FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?`, [id]);

    const [tasks] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ?
      ORDER BY t.due_date ASC`, [id]);

    res.json({ ...projects[0], members, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching project.' });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { project_name, description, start_date, end_date, status } = req.body;
    if (!project_name) return res.status(400).json({ message: 'Project name is required.' });

    const [result] = await db.query(
      'INSERT INTO projects (project_name, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [project_name, description, start_date, end_date, status || 'planning', req.user.id]
    );
    res.status(201).json({ message: 'Project created.', project_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating project.' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, description, start_date, end_date, status } = req.body;
    await db.query(
      'UPDATE projects SET project_name=?, description=?, start_date=?, end_date=?, status=? WHERE project_id=?',
      [project_name, description, start_date, end_date, status, id]
    );
    res.json({ message: 'Project updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project.' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM projects WHERE project_id = ?', [id]);
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project.' });
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
