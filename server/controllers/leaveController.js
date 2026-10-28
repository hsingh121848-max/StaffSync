const { Leave, Employee, Manager, User } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

/**
 * @desc    Submit a new leave application
 * @route   POST /api/leaves
 * @access  Private (Employee)
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leaveType, startDate, endDate, and reason',
      });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Leave start date cannot be after end date',
      });
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping active leaves
    const overlapping = await Leave.findOne({
      employeeId: employee._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a Pending or Approved leave overlapping this date range',
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: 'Pending',
    });

    // Notify Manager if assigned
    if (employee.managerId) {
      const manager = await Manager.findById(employee.managerId);
      if (manager) {
        await createNotification({
          recipientId: manager.userId,
          title: 'New Leave Application',
          message: `${employee.firstName} ${employee.lastName} submitted a ${leaveType} leave request for ${totalDays} day(s).`,
          type: 'Leave',
          actionUrl: '/leaves',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in employee's leave applications
 * @route   GET /api/leaves/my
 * @access  Private (Employee)
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const leaves = await Leave.find({ employeeId: employee._id })
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave requests for Manager's direct reports
 * @route   GET /api/leaves/team
 * @access  Private (Manager)
 */
const getTeamLeaves = async (req, res, next) => {
  try {
    const manager = await Manager.findOne({ userId: req.user._id });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found',
      });
    }

    const { status } = req.query;
    const query = { employeeId: { $in: manager.teamMembers } };
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeId department designation')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all organizational leave requests
 * @route   GET /api/leaves/all
 * @access  Private (HR)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeId department designation')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a leave request
 * @route   PUT /api/leaves/:id/status
 * @access  Private (Manager & HR)
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'",
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    // Role permission check:
    // If user is Manager (and not HR), verify employee is in their team
    if (req.user.role === 'manager') {
      const manager = await Manager.findOne({ userId: req.user._id });
      if (!manager || !manager.teamMembers.includes(leave.employeeId._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only approve or reject leaves for direct reports',
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewRemarks = reviewRemarks || '';

    await leave.save();

    // Notify employee of review outcome
    if (leave.employeeId && leave.employeeId.userId) {
      await createNotification({
        recipientId: leave.employeeId.userId,
        title: `Leave ${status}`,
        message: `Your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.${reviewRemarks ? ' Remarks: ' + reviewRemarks : ''}`,
        type: 'Leave',
        actionUrl: '/leaves',
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave application ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
