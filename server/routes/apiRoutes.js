const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const managerRoutes = require('./managerRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const announcementRoutes = require('./announcementRoutes');
const trainingRoutes = require('./trainingRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');

const { getDashboardStats } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StaffSync REST API is running and operational.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Dashboard stats shortcut
router.get('/dashboard/stats', verifyToken, getDashboardStats);

// Sub-route mounts
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/managers', managerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/announcements', announcementRoutes);
router.use('/trainings', trainingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
