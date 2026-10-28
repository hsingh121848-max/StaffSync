const { Manager, Employee, User } = require('../models');

/**
 * @desc    Get current manager's assigned team roster
 * @route   GET /api/managers/team
 * @access  Private (Manager)
 */
const getMyTeam = async (req, res, next) => {
  try {
    const manager = await Manager.findOne({ userId: req.user._id }).populate({
      path: 'teamMembers',
      populate: { path: 'userId', select: 'email isActive' },
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: manager.teamMembers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all managers across the organization
 * @route   GET /api/managers
 * @access  Private (HR)
 */
const getAllManagers = async (req, res, next) => {
  try {
    const managers = await Manager.find()
      .populate('userId', 'email isActive role')
      .populate('teamMembers', 'firstName lastName employeeId department designation');

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign user as manager with department jurisdiction
 * @route   POST /api/managers
 * @access  Private (HR)
 */
const createManager = async (req, res, next) => {
  try {
    const { userId, department } = req.body;

    if (!userId || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both userId and department',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure role is elevated to 'manager'
    user.role = 'manager';
    await user.save();

    // Check if manager profile already exists
    let manager = await Manager.findOne({ userId });
    if (manager) {
      manager.department = department;
      await manager.save();
    } else {
      manager = await Manager.create({
        userId,
        department,
        teamMembers: [],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Manager configured successfully',
      data: manager,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add performance review/rating note to direct report [RECOMMENDATION]
 * @route   POST /api/managers/performance/:employeeId
 * @access  Private (Manager)
 */
const addPerformanceNote = async (req, res, next) => {
  try {
    const { note, rating } = req.body;
    const { employeeId } = req.params;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Performance review note is required',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Verify manager oversees this employee
    const manager = await Manager.findOne({ userId: req.user._id });
    if (!manager || !manager.teamMembers.includes(employee._id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only record performance notes for direct reports',
      });
    }

    employee.performanceNotes.push({
      date: new Date(),
      note,
      rating: rating ? Number(rating) : undefined,
      reviewerId: req.user._id,
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Performance feedback note recorded successfully',
      data: employee.performanceNotes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTeam,
  getAllManagers,
  createManager,
  addPerformanceNote,
};
