const express = require('express');
const router = express.Router();
const {
  createTraining,
  getAllTrainings,
  getMyTrainings,
  assignTraining,
  updateTrainingProgress,
} = require('../controllers/trainingController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Employee view assigned trainings and update progress
router.get('/my', verifyToken, authorizeRoles('employee'), getMyTrainings);
router.put('/:id/progress', verifyToken, authorizeRoles('employee'), updateTrainingProgress);

// Manager and HR training administration
router.get('/', verifyToken, authorizeRoles('manager', 'hr'), getAllTrainings);
router.post('/', verifyToken, authorizeRoles('manager', 'hr'), createTraining);
router.post('/:id/assign', verifyToken, authorizeRoles('manager', 'hr'), assignTraining);

module.exports = router;
