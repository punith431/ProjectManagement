const db = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

// Add member to project
const addProjectMember = async (req, res) => {
  try {
    const { project_id, user_id, role } = req.body;
    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [project_id, user_id, role || 'developer']
    );
    res.status(201).json({ message: 'Member added to project.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'User already a member.' });
    res.status(500).json({ message: 'Error adding member.' });
  }
};

// Remove member from project
const removeProjectMember = async (req, res) => {
  try {
    const { project_id, user_id } = req.params;
    await db.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [project_id, user_id]);
    res.json({ message: 'Member removed from project.' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing member.' });
  }
};

// Get project members
const getProjectMembers = async (req, res) => {
  try {
    const [members] = await db.query(`
      SELECT pm.*, u.name, u.email, u.role AS user_role FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?`, [req.params.project_id]);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members.' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role.' });
  }
};

module.exports = { getAllUsers, addProjectMember, removeProjectMember, getProjectMembers, updateUserRole };
