const express = require('express');
const router = express.Router();
const { getHRAnalytics, getDashboardStats } = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// HR Aggregate Analytics
router.get('/analytics', verifyToken, authorizeRoles('hr'), getHRAnalytics);

// Role-tailored Dashboard Statistics
router.get('/dashboard-stats', verifyToken, getDashboardStats);

module.exports = router;
