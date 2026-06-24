const express = require('express');
const router = express.Router();
const { getDashboardStats, getProjectReport } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard', verifyToken, getDashboardStats);
router.get('/project/:id', verifyToken, getProjectReport);

module.exports = router;
