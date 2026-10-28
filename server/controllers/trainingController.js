const { Training, Employee, User } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

/**
 * @desc    Create a new training program
 * @route   POST /api/trainings
 * @access  Private (Manager & HR)
 */
const createTraining = async (req, res, next) => {
  try {
    const { title, description, trainerOrProvider, startDate, endDate, category, assignedEmployeeIds } = req.body;

    if (!title || !description || !trainerOrProvider || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required training program fields: title, description, trainerOrProvider, startDate, and endDate',
      });
    }

    const assigned = [];
    if (Array.isArray(assignedEmployeeIds)) {
      assignedEmployeeIds.forEach((empId) => {
        assigned.push({ employeeId: empId, status: 'Enrolled' });
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      trainerOrProvider: trainerOrProvider.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      category: category || 'General',
      assignedEmployees: assigned,
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all training programs
 * @route   GET /api/trainings
 * @access  Private (Manager & HR)
 */
const getAllTrainings = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const trainings = await Training.find(query)
      .populate('assignedEmployees.employeeId', 'firstName lastName employeeId department designation')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainings assigned to logged in employee
 * @route   GET /api/trainings/my
 * @access  Private (Employee)
 */
const getMyTrainings = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const trainings = await Training.find({
      'assignedEmployees.employeeId': employee._id,
    }).sort({ startDate: 1 });

    // Format output with the employee's specific progress
    const formatted = trainings.map((t) => {
      const enrollment = t.assignedEmployees.find(
        (a) => a.employeeId.toString() === employee._id.toString()
      );
      return {
        _id: t._id,
        title: t.title,
        description: t.description,
        trainerOrProvider: t.trainerOrProvider,
        startDate: t.startDate,
        endDate: t.endDate,
        overallStatus: t.status,
        myStatus: enrollment ? enrollment.status : 'Enrolled',
        completedAt: enrollment ? enrollment.completedAt : null,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign team member(s) to a training program
 * @route   POST /api/trainings/:id/assign
 * @access  Private (Manager & HR)
 */
const assignTraining = async (req, res, next) => {
  try {
    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of employeeIds to assign',
      });
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    employeeIds.forEach((empId) => {
      const exists = training.assignedEmployees.some(
        (a) => a.employeeId.toString() === empId.toString()
      );
      if (!exists) {
        training.assignedEmployees.push({
          employeeId: empId,
          status: 'Enrolled',
          enrolledAt: new Date(),
        });
      }
    });

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Employees assigned to training program successfully',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee updates their training completion progress
 * @route   PUT /api/trainings/:id/progress
 * @access  Private (Employee)
 */
const updateTrainingProgress = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Enrolled', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Enrolled', 'In Progress', or 'Completed'",
      });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const enrollment = training.assignedEmployees.find(
      (a) => a.employeeId.toString() === employee._id.toString()
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this training program',
      });
    }

    enrollment.status = status;
    if (status === 'Completed') {
      enrollment.completedAt = new Date();
    }

    await training.save();

    res.status(200).json({
      success: true,
      message: `Training status updated to ${status}`,
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTraining,
  getAllTrainings,
  getMyTrainings,
  assignTraining,
  updateTrainingProgress,
};
