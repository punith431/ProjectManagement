const express = require('express');
const router = express.Router();
const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { verifyToken, isManagerOrAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllProjects);
router.get('/:id', verifyToken, getProjectById);
router.post('/', verifyToken, isManagerOrAdmin, createProject);
router.put('/:id', verifyToken, isManagerOrAdmin, updateProject);
router.delete('/:id', verifyToken, isManagerOrAdmin, deleteProject);

module.exports = router;
