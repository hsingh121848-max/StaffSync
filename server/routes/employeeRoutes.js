const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
} = require('../controllers/employeeController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Employee Self-Service
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

// HR Workforce Administration
router.get('/', verifyToken, authorizeRoles('hr'), getAllEmployees);
router.post('/', verifyToken, authorizeRoles('hr'), createEmployee);

// HR and Manager Access
router.get('/:id', verifyToken, authorizeRoles('hr', 'manager'), getEmployeeById);
router.put('/:id', verifyToken, authorizeRoles('hr'), updateEmployee);

module.exports = router;
