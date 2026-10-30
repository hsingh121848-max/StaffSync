// StaffSync Secure Demo Authentication & Evaluation Data Service
// Operates as an in-memory evaluation fallback ONLY when MongoDB is disconnected.
// When MongoDB is connected (mongoose.connection.readyState === 1), all controllers query MongoDB.
const bcrypt = require('bcryptjs');

const DEMO_USERS = [
  {
    _id: '65c1a3333333333333333333',
    email: 'admin@staffsync.com',
    passwordHash: bcrypt.hashSync('AdminPassword123!', 10),
    role: 'hr',
    firstName: 'HR',
    lastName: 'Administrator',
    department: 'HR',
    designation: 'Head of Human Resources',
    employeeId: 'EMP-HR01',
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    _id: '65c1a2222222222222222222',
    email: 'manager.john@staffsync.com',
    passwordHash: bcrypt.hashSync('ManagerPassword123!', 10),
    role: 'manager',
    firstName: 'John',
    lastName: 'Vance',
    department: 'Engineering',
    designation: 'Engineering Manager',
    employeeId: 'EMP-MGR01',
    createdAt: new Date('2025-01-10').toISOString(),
  },
  {
    _id: '65c1a1111111111111111111',
    email: 'employee.sarah@staffsync.com',
    passwordHash: bcrypt.hashSync('EmployeePassword123!', 10),
    role: 'employee',
    firstName: 'Sarah',
    lastName: 'Connor',
    department: 'Engineering',
    designation: 'Senior Frontend Developer',
    employeeId: 'EMP-1001',
    phone: '+1-555-0101',
    address: '100 Silicon Blvd, Suite 400',
    dateOfJoining: new Date('2025-01-15').toISOString(),
    createdAt: new Date('2025-01-15').toISOString(),
  },
  {
    _id: '65c1a1111111111111111112',
    email: 'employee.alex@staffsync.com',
    passwordHash: bcrypt.hashSync('EmployeePassword123!', 10),
    role: 'employee',
    firstName: 'Alex',
    lastName: 'Murphy',
    department: 'Engineering',
    designation: 'Backend Systems Engineer',
    employeeId: 'EMP-1002',
    phone: '+1-555-0102',
    address: '200 Tech Way, Floor 2',
    dateOfJoining: new Date('2025-03-01').toISOString(),
    createdAt: new Date('2025-03-01').toISOString(),
  },
];

// In-memory evaluation data store for demo sessions when DB is offline
const inMemoryStore = {
  attendance: [
    {
      _id: '65c1b1111111111111111101',
      employeeId: {
        _id: '65c1a1111111111111111111',
        firstName: 'Sarah',
        lastName: 'Connor',
        employeeId: 'EMP-1001',
        department: 'Engineering',
        designation: 'Senior Frontend Developer',
      },
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date(new Date().setHours(9, 2, 0, 0)),
      checkOut: null,
      status: 'Present',
      workingHours: 0,
    },
    {
      _id: '65c1b1111111111111111102',
      employeeId: {
        _id: '65c1a1111111111111111112',
        firstName: 'Alex',
        lastName: 'Murphy',
        employeeId: 'EMP-1002',
        department: 'Engineering',
        designation: 'Backend Systems Engineer',
      },
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date(new Date().setHours(9, 45, 0, 0)),
      checkOut: null,
      status: 'Late',
      workingHours: 0,
    },
  ],
  leaves: [
    {
      _id: '65c1c1111111111111111101',
      employeeId: {
        _id: '65c1a1111111111111111111',
        firstName: 'Sarah',
        lastName: 'Connor',
        employeeId: 'EMP-1001',
        department: 'Engineering',
      },
      leaveType: 'Annual',
      startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 8 * 86400000).toISOString(),
      durationDays: 3,
      reason: 'Family vacation and personal travel',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '65c1c1111111111111111102',
      employeeId: {
        _id: '65c1a1111111111111111112',
        firstName: 'Alex',
        lastName: 'Murphy',
        employeeId: 'EMP-1002',
        department: 'Engineering',
      },
      leaveType: 'Casual',
      startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      endDate: new Date(Date.now() - 9 * 86400000).toISOString(),
      durationDays: 1,
      reason: 'Home maintenance',
      status: 'Approved',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ],
  announcements: [
    {
      _id: '65c1d1111111111111111101',
      title: 'Welcome to StaffSync HRMS Platform',
      content: 'Welcome to the StaffSync evaluation portal. Real-time attendance, leave pipeline, and workforce administration are active.',
      priority: 'High',
      targetAudience: 'All',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '65c1d1111111111111111102',
      title: 'Annual Performance & Upskilling Review',
      content: 'Department managers are requested to complete quarterly training allocation reviews by month-end.',
      priority: 'Normal',
      targetAudience: 'Manager',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  trainings: [
    {
      _id: '65c1e1111111111111111101',
      title: 'Advanced Cloud Architecture & Security Practices',
      description: 'Hands-on microservices security, container orchestration, and fault-tolerant patterns.',
      instructor: 'Enterprise Tech Academy',
      department: 'Engineering',
      duration: '4 Weeks',
      startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 31 * 86400000).toISOString(),
      assignedEmployees: ['65c1a1111111111111111111', '65c1a1111111111111111112'],
      status: 'Scheduled',
    },
  ],
  notifications: [
    {
      _id: '65c1f1111111111111111101',
      recipientId: '65c1a1111111111111111111',
      title: 'Welcome to StaffSync',
      message: 'Your profile has been initialized. You can now punch attendance and apply for leaves.',
      type: 'General',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

/**
 * Genuine authentication verification against demo evaluation fixtures.
 * Enforces real bcrypt hash comparison and valid credentials.
 * Rejects invalid passwords or unknown emails with null (resulting in HTTP 401).
 */
const authenticateDemoUser = async (email, password) => {
  if (!email || !password) return null;
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null; // Email not found -> HTTP 401

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return null; // Password mismatch -> HTTP 401

  return user;
};

const getDemoUserById = (id) => {
  return DEMO_USERS.find((u) => u._id === String(id)) || null;
};

const getDemoEmployees = () => {
  return [
    {
      _id: '65c1a1111111111111111111',
      userId: { _id: '65c1a1111111111111111111', email: 'employee.sarah@staffsync.com', role: 'employee', isActive: true },
      employeeId: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Connor',
      department: 'Engineering',
      designation: 'Senior Frontend Developer',
      phone: '+1-555-0101',
      dateOfJoining: '2025-01-15T00:00:00.000Z',
      managerId: { _id: '65c1a2222222222222222222', department: 'Engineering' },
    },
    {
      _id: '65c1a1111111111111111112',
      userId: { _id: '65c1a1111111111111111112', email: 'employee.alex@staffsync.com', role: 'employee', isActive: true },
      employeeId: 'EMP-1002',
      firstName: 'Alex',
      lastName: 'Murphy',
      department: 'Engineering',
      designation: 'Backend Systems Engineer',
      phone: '+1-555-0102',
      dateOfJoining: '2025-03-01T00:00:00.000Z',
      managerId: { _id: '65c1a2222222222222222222', department: 'Engineering' },
    },
    {
      _id: '65c1a2222222222222222222',
      userId: { _id: '65c1a2222222222222222222', email: 'manager.john@staffsync.com', role: 'manager', isActive: true },
      employeeId: 'EMP-MGR01',
      firstName: 'John',
      lastName: 'Vance',
      department: 'Engineering',
      designation: 'Engineering Manager',
      phone: '+1-555-0100',
      dateOfJoining: '2025-01-10T00:00:00.000Z',
    },
  ];
};

const getDemoManagers = () => {
  return [
    {
      _id: '65c1a2222222222222222222',
      userId: { _id: '65c1a2222222222222222222', email: 'manager.john@staffsync.com', role: 'manager' },
      department: 'Engineering',
      teamMembers: [
        { _id: '65c1a1111111111111111111', firstName: 'Sarah', lastName: 'Connor' },
        { _id: '65c1a1111111111111111112', firstName: 'Alex', lastName: 'Murphy' },
      ],
      createdAt: '2025-01-10T00:00:00.000Z',
    },
  ];
};

const getDemoDashboardStats = (role) => {
  if (role === 'hr') {
    return {
      totalEmployees: 3,
      totalManagers: 1,
      todayPresent: inMemoryStore.attendance.filter((a) => a.status === 'Present').length,
      pendingLeaves: inMemoryStore.leaves.filter((l) => l.status === 'Pending').length,
      activeTrainings: inMemoryStore.trainings.length,
      unreadNotifications: 0,
    };
  } else if (role === 'manager') {
    return {
      teamSize: 2,
      teamPresentToday: 2,
      pendingLeaveApprovals: inMemoryStore.leaves.filter((l) => l.status === 'Pending').length,
      teamTrainingsActive: 1,
      unreadNotifications: 0,
    };
  } else {
    return {
      todayAttendance: 'Present',
      pendingLeaves: inMemoryStore.leaves.filter((l) => l.status === 'Pending').length,
      enrolledTrainings: 1,
      unreadNotifications: 1,
    };
  }
};

const getDemoHRAnalytics = () => {
  const today = new Date().toISOString().split('T')[0];
  return {
    workforce: {
      totalEmployees: 3,
      totalManagers: 1,
      activeUsers: 4,
    },
    departmentBreakdown: [
      { _id: 'Engineering', count: 3 },
      { _id: 'HR', count: 1 },
    ],
    todayAttendance: {
      date: today,
      breakdown: [
        { _id: 'Present', count: 1 },
        { _id: 'Late', count: 1 },
      ],
    },
    leaveRequests: [
      { _id: 'Pending', count: 1 },
      { _id: 'Approved', count: 1 },
    ],
    activeTrainings: 1,
  };
};

module.exports = {
  DEMO_USERS,
  inMemoryStore,
  authenticateDemoUser,
  getDemoUserById,
  getDemoEmployees,
  getDemoManagers,
  getDemoDashboardStats,
  getDemoHRAnalytics,
};
