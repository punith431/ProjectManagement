const express = require('express');
const router = express.Router();
const { getAllUsers, addProjectMember, removeProjectMember, getProjectMembers, updateUserRole } = require('../controllers/teamController');
const { verifyToken, isAdmin, isManagerOrAdmin } = require('../middleware/auth');

router.get('/users', verifyToken, getAllUsers);
router.get('/project/:project_id/members', verifyToken, getProjectMembers);
router.post('/project/member', verifyToken, isManagerOrAdmin, addProjectMember);
router.delete('/project/:project_id/member/:user_id', verifyToken, isManagerOrAdmin, removeProjectMember);
router.put('/users/:id/role', verifyToken, isAdmin, updateUserRole);

module.exports = router;
