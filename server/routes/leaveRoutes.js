const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Employee Leave Endpoints
router.post('/', verifyToken, authorizeRoles('employee'), applyLeave);
router.get('/my', verifyToken, authorizeRoles('employee'), getMyLeaves);

// Manager Team Leave Endpoints
router.get('/team', verifyToken, authorizeRoles('manager'), getTeamLeaves);

// HR Global Leave Oversight
router.get('/all', verifyToken, authorizeRoles('hr'), getAllLeaves);

// Review & Approval (Manager for team direct reports, HR for global override)
router.put('/:id/status', verifyToken, authorizeRoles('manager', 'hr'), updateLeaveStatus);

module.exports = router;
