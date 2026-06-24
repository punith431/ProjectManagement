const db = require('../config/db');

// Get all tasks (optionally by project)
const getTasks = async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = `
      SELECT t.*, u.name AS assigned_to_name, p.project_name FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.project_id
    `;
    const params = [];
    if (project_id) {
      query += ' WHERE t.project_id = ?';
      params.push(project_id);
    }
    query += ' ORDER BY t.due_date ASC';

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks.' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name, p.project_name FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE t.task_id = ?`, [req.params.id]);
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json(tasks[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task.' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { project_id, task_name, description, assigned_to, priority, status, due_date } = req.body;
    if (!project_id || !task_name) return res.status(400).json({ message: 'Project ID and task name are required.' });

    const [result] = await db.query(
      'INSERT INTO tasks (project_id, task_name, description, assigned_to, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [project_id, task_name, description, assigned_to, priority || 'medium', status || 'todo', due_date]
    );
    res.status(201).json({ message: 'Task created.', task_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task.' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { task_name, description, assigned_to, priority, status, due_date } = req.body;
    await db.query(
      'UPDATE tasks SET task_name=?, description=?, assigned_to=?, priority=?, status=?, due_date=? WHERE task_id=?',
      [task_name, description, assigned_to, priority, status, due_date, req.params.id]
    );
    res.json({ message: 'Task updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task.' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE task_id = ?', [req.params.id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task.' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
