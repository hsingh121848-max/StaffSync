const { Attendance, Employee, Manager } = require('../models');

/**
 * @desc    Record daily employee check-in
 * @route   POST /api/attendance/check-in
 * @access  Private (Employee)
 */
const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found for this user',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Check if attendance already recorded today
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: `Check-in already recorded for today (${attendance.checkInTime.toLocaleTimeString()})`,
        data: attendance,
      });
    }

    // Determine status (Late if check-in is after 09:30 AM local server time) [RECOMMENDATION]
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const initialStatus = isLate ? 'Late' : 'Present';

    if (!attendance) {
      attendance = await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkInTime: now,
        status: initialStatus,
        notes: req.body.notes || 'Daily Check-in',
      });
    } else {
      attendance.checkInTime = now;
      attendance.status = initialStatus;
      await attendance.save();
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully as ${initialStatus}`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record daily employee check-out and compute hours worked
 * @route   POST /api/attendance/check-out
 * @access  Private (Employee)
 */
const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. You must check-in before checking out.',
      });
    }

    attendance.checkOutTime = now;

    // Calculate hours worked
    const diffMs = now - new Date(attendance.checkInTime);
    const hours = Math.max(0, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
    attendance.hoursWorked = hours;

    // Auto mark Half-day if worked under 4 hours [RECOMMENDATION]
    if (hours < 4 && attendance.status !== 'Absent') {
      attendance.status = 'Half-day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours: ${hours} hrs`,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in employee's personal attendance history
 * @route   GET /api/attendance/my
 * @access  Private (Employee)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const { month, year, page = 1, limit = 31 } = req.query;
    const query = { employeeId: employee._id };

    if (month && year) {
      const formattedMonth = month.padStart(2, '0');
      query.date = { $regex: `^${year}-${formattedMonth}` };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team attendance for Manager's direct reports
 * @route   GET /api/attendance/team
 * @access  Private (Manager)
 */
const getTeamAttendance = async (req, res, next) => {
  try {
    const manager = await Manager.findOne({ userId: req.user._id });
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found',
      });
    }

    const date = req.query.date || new Date().toISOString().split('T')[0];

    const records = await Attendance.find({
      employeeId: { $in: manager.teamMembers },
      date: date,
    }).populate('employeeId', 'firstName lastName employeeId designation department');

    res.status(200).json({
      success: true,
      date,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get organization-wide attendance records
 * @route   GET /api/attendance/all
 * @access  Private (HR)
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (date) query.date = date;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);

    let records = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeId department designation')
      .sort({ date: -1, checkInTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Filter by department if specified
    if (department) {
      records = records.filter(
        (r) => r.employeeId && r.employeeId.department.toLowerCase() === department.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
};
