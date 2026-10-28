const express = require('express');
const router = express.Router();
const {
  getMyTeam,
  getAllManagers,
  createManager,
  addPerformanceNote,
} = require('../controllers/managerController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Manager Team Roster
router.get('/team', verifyToken, authorizeRoles('manager'), getMyTeam);

// Manager Performance Review [RECOMMENDATION]
router.post('/performance/:employeeId', verifyToken, authorizeRoles('manager'), addPerformanceNote);

// HR Manager Administration
router.get('/', verifyToken, authorizeRoles('hr'), getAllManagers);
router.post('/', verifyToken, authorizeRoles('hr'), createManager);

module.exports = router;
