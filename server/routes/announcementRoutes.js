const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// View Announcements (All authenticated users: Employee, Manager, HR)
router.get('/', verifyToken, getAnnouncements);

// Author & Manage Announcements (HR only)
router.post('/', verifyToken, authorizeRoles('hr'), createAnnouncement);
router.delete('/:id', verifyToken, authorizeRoles('hr'), deleteAnnouncement);

module.exports = router;
