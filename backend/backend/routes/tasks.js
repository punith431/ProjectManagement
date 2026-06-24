const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getTasks);
router.get('/:id', verifyToken, getTaskById);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
