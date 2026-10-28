const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Employee Daily Attendance
router.post('/check-in', verifyToken, authorizeRoles('employee'), checkIn);
router.post('/check-out', verifyToken, authorizeRoles('employee'), checkOut);
router.get('/my', verifyToken, authorizeRoles('employee'), getMyAttendance);

// Manager Team Attendance
router.get('/team', verifyToken, authorizeRoles('manager'), getTeamAttendance);

// HR Global Attendance Audit
router.get('/all', verifyToken, authorizeRoles('hr'), getAllAttendance);

module.exports = router;
