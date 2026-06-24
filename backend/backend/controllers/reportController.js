const db = require('../config/db');

// Dashboard analytics
const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_projects }]] = await db.query('SELECT COUNT(*) AS total_projects FROM projects');
    const [[{ total_tasks }]] = await db.query('SELECT COUNT(*) AS total_tasks FROM tasks');
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ completed_tasks }]] = await db.query("SELECT COUNT(*) AS completed_tasks FROM tasks WHERE status = 'completed'");
    const [[{ active_projects }]] = await db.query("SELECT COUNT(*) AS active_projects FROM projects WHERE status = 'active'");

    const [tasksByStatus] = await db.query(`
      SELECT status, COUNT(*) AS count FROM tasks GROUP BY status`);

    const [projectsByStatus] = await db.query(`
      SELECT status, COUNT(*) AS count FROM projects GROUP BY status`);

    const [recentProjects] = await db.query(`
      SELECT p.project_id, p.project_name, p.status, p.end_date, u.name AS created_by_name
      FROM projects p LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC LIMIT 5`);

    const [recentTasks] = await db.query(`
      SELECT t.task_id, t.task_name, t.status, t.priority, t.due_date, u.name AS assigned_to_name, p.project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.project_id
      ORDER BY t.created_at DESC LIMIT 5`);

    res.json({
      stats: { total_projects, total_tasks, total_users, completed_tasks, active_projects },
      tasksByStatus,
      projectsByStatus,
      recentProjects,
      recentTasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching dashboard data.' });
  }
};

// Project report
const getProjectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await db.query(`
      SELECT p.*, u.name AS created_by_name FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.project_id = ?`, [id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const [taskStats] = await db.query(`
      SELECT status, priority, COUNT(*) AS count FROM tasks WHERE project_id = ? GROUP BY status, priority`, [id]);

    const [members] = await db.query(`
      SELECT u.name, u.email, pm.role,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND project_id = ?) AS assigned_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND project_id = ? AND status = 'completed') AS completed_tasks
      FROM project_members pm JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?`, [id, id, id]);

    res.json({ project: projects[0], taskStats, members });
  } catch (err) {
    res.status(500).json({ message: 'Error generating report.' });
  }
};

module.exports = { getDashboardStats, getProjectReport };
