const mongoose = require('mongoose');
const { Employee, User, Manager, Attendance, Leave, Training, Announcement, Notification } = require('../models');
const { getDemoDashboardStats, getDemoHRAnalytics } = require('../utils/demoAuthService');

/**
 * @desc    Get aggregated organizational reports & analytics
 * @route   GET /api/reports/analytics
 * @access  Private (HR)
 */
const getHRAnalytics = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: getDemoHRAnalytics(),
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Total employees and managers
    const totalEmployees = await Employee.countDocuments();
    const totalManagers = await Manager.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Department breakdown
    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Today's attendance summary
    const attendanceStats = await Attendance.aggregate([
      { $match: { date: today } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Leave requests summary
    const leaveStats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Active trainings
    const activeTrainings = await Training.countDocuments({ status: { $ne: 'Completed' } });

    res.status(200).json({
      success: true,
      data: {
        workforce: {
          totalEmployees,
          totalManagers,
          activeUsers,
        },
        departmentBreakdown: departmentStats,
        todayAttendance: {
          date: today,
          breakdown: attendanceStats,
        },
        leaveRequests: leaveStats,
        activeTrainings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get role-specific dashboard summary statistics
 * @route   GET /api/dashboard/stats
 * @access  Private (All Roles)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          role: req.user.role,
          ...getDemoDashboardStats(req.user.role),
        },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const role = req.user.role;

    if (role === 'employee') {
      const employee = await Employee.findOne({ userId: req.user._id });
      if (!employee) {
        return res.status(200).json({ success: true, data: { message: 'Profile not initialized' } });
      }

      const todayAttendance = await Attendance.findOne({ employeeId: employee._id, date: today });
      const pendingLeaves = await Leave.countDocuments({ employeeId: employee._id, status: 'Pending' });
      const myTrainings = await Training.countDocuments({ 'assignedEmployees.employeeId': employee._id });
      const unreadNotifications = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

      return res.status(200).json({
        success: true,
        data: {
          role: 'employee',
          todayAttendance: todayAttendance ? todayAttendance.status : 'Not Marked',
          todayCheckIn: todayAttendance?.checkInTime || null,
          todayCheckOut: todayAttendance?.checkOutTime || null,
          pendingLeaves,
          enrolledTrainings: myTrainings,
          unreadNotifications,
        },
      });
    }

    if (role === 'manager') {
      const manager = await Manager.findOne({ userId: req.user._id });
      const teamCount = manager ? manager.teamMembers.length : 0;
      const teamMembers = manager ? manager.teamMembers : [];

      const todayPresentCount = await Attendance.countDocuments({
        employeeId: { $in: teamMembers },
        date: today,
        status: { $in: ['Present', 'Late'] },
      });

      const pendingTeamLeaves = await Leave.countDocuments({
        employeeId: { $in: teamMembers },
        status: 'Pending',
      });

      return res.status(200).json({
        success: true,
        data: {
          role: 'manager',
          teamSize: teamCount,
          todayPresentCount,
          pendingTeamLeaves,
        },
      });
    }

    if (role === 'hr') {
      const totalEmployees = await Employee.countDocuments();
      const totalManagers = await Manager.countDocuments();
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const totalAnnouncements = await Announcement.countDocuments();

      const todayPresent = await Attendance.countDocuments({
        date: today,
        status: { $in: ['Present', 'Late'] },
      });

      const turnoutPercent = totalEmployees > 0 ? Math.round((todayPresent / totalEmployees) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          role: 'hr',
          totalEmployees,
          totalManagers,
          pendingLeaves,
          todayTurnoutPercent: turnoutPercent,
          totalAnnouncements,
        },
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHRAnalytics,
  getDashboardStats,
};
