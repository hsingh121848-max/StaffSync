const mongoose = require('mongoose');
const { Employee, User, Manager } = require('../models');
const { getDemoEmployees } = require('../utils/demoAuthService');

/**
 * @desc    Get current employee's personal profile
 * @route   GET /api/employees/me
 * @access  Private (Employee)
 */
const getMyProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const demoEmp = getDemoEmployees()[0];
      return res.status(200).json({ success: true, data: demoEmp });
    }

    const employee = await Employee.findOne({ userId: req.user._id }).populate('managerId');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found for this user account',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee personal information (self-service)
 * @route   PUT /api/employees/me
 * @access  Private (Employee)
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, address, emergencyContact } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Only allow updating permitted personal contact fields
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact;

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Personal profile updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees with optional search & pagination
 * @route   GET /api/employees
 * @access  Private (HR)
 */
const getAllEmployees = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const demoList = getDemoEmployees();
      return res.status(200).json({
        success: true,
        total: demoList.length,
        page: 1,
        pages: 1,
        data: demoList,
      });
    }

    const { search, department, page = 1, limit = 10 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('userId', 'email role isActive')
      .populate('managerId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (HR & Manager)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'email role isActive')
      .populate('managerId');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Role check: If Manager, verify this employee belongs to their team
    if (req.user.role === 'manager') {
      const manager = await Manager.findOne({ userId: req.user._id });
      if (!manager || !manager.teamMembers.includes(employee._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Employee does not belong to your team roster',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new employee and linked user account
 * @route   POST /api/employees
 * @access  Private (HR)
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      password,
      employeeId,
      firstName,
      lastName,
      phone,
      department,
      designation,
      dateOfJoining,
      managerId,
      address,
      emergencyContact,
    } = req.body;

    if (!email || !password || !employeeId || !firstName || !lastName || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required employee fields: email, password, employeeId, firstName, lastName, department, designation are mandatory',
      });
    }

    // Check email uniqueness
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email already exists',
      });
    }

    // Check employeeId uniqueness
    const empIdExists = await Employee.findOne({ employeeId: employeeId.toUpperCase() });
    if (empIdExists) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is already in use',
      });
    }

    // 1. Create User
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'employee',
    });

    // 2. Create Employee Profile
    const employee = await Employee.create({
      userId: user._id,
      employeeId: employeeId.toUpperCase(),
      firstName,
      lastName,
      phone: phone || '',
      department,
      designation,
      dateOfJoining: dateOfJoining || new Date(),
      managerId: managerId || null,
      address: address || '',
      emergencyContact: emergencyContact || '',
    });

    // If manager assigned, link employee into manager's teamMembers array
    if (managerId) {
      await Manager.findByIdAndUpdate(managerId, {
        $addToSet: { teamMembers: employee._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee administrative data
 * @route   PUT /api/employees/:id
 * @access  Private (HR)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      firstName,
      lastName,
      phone,
      department,
      designation,
      managerId,
      address,
      emergencyContact,
      isActive,
      role,
    } = req.body;

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (address !== undefined) employee.address = address;
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact;

    // Handle manager reassignment
    if (managerId !== undefined && managerId !== employee.managerId?.toString()) {
      // Remove from previous manager's list
      if (employee.managerId) {
        await Manager.findByIdAndUpdate(employee.managerId, {
          $pull: { teamMembers: employee._id },
        });
      }
      // Add to new manager's list
      if (managerId) {
        await Manager.findByIdAndUpdate(managerId, {
          $addToSet: { teamMembers: employee._id },
        });
      }
      employee.managerId = managerId || null;
    }

    await employee.save();

    // Update user status or role if provided
    if (isActive !== undefined || role !== undefined) {
      const userUpdates = {};
      if (isActive !== undefined) userUpdates.isActive = isActive;
      if (role && ['employee', 'manager', 'hr'].includes(role)) userUpdates.role = role;
      await User.findByIdAndUpdate(employee.userId, userUpdates);
    }

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
};
