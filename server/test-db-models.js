// Phase 3 Schema and Model Verification Script for StaffSync
const mongoose = require('mongoose');
const {
  User,
  Employee,
  Manager,
  Attendance,
  Leave,
  Announcement,
  Training,
  Notification,
} = require('./models');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${message}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${message}`);
    process.exitCode = 1;
  }
}

async function runModelTests() {
  console.log('--- StaffSync Phase 3: Mongoose Schemas & Models Verification ---');

  // Test 1: All 8 models exist
  assert(User && User.modelName === 'User', 'User model is properly registered in Mongoose');
  assert(Employee && Employee.modelName === 'Employee', 'Employee model is properly registered in Mongoose');
  assert(Manager && Manager.modelName === 'Manager', 'Manager model is properly registered in Mongoose');
  assert(Attendance && Attendance.modelName === 'Attendance', 'Attendance model is properly registered in Mongoose');
  assert(Leave && Leave.modelName === 'Leave', 'Leave model is properly registered in Mongoose');
  assert(Announcement && Announcement.modelName === 'Announcement', 'Announcement model is properly registered in Mongoose');
  assert(Training && Training.modelName === 'Training', 'Training model is properly registered in Mongoose');
  assert(Notification && Notification.modelName === 'Notification', 'Notification model is properly registered in Mongoose');

  // Test 2: User Schema Validation
  const validUser = new User({
    email: 'admin@staffsync.com',
    password: 'SecurePassword123!',
    role: 'hr',
  });
  assert(validUser.validateSync() === undefined, 'Valid User passes schema validation');

  const invalidUser = new User({
    email: 'not-an-email',
    password: '123',
    role: 'superadmin', // invalid role
  });
  const userErr = invalidUser.validateSync();
  assert(userErr && userErr.errors.email, 'User schema rejects invalid email format');
  assert(userErr && userErr.errors.password, 'User schema enforces minimum password length (>= 6)');
  assert(userErr && userErr.errors.role, 'User schema rejects unapproved roles');

  // Test 3: Password Hashing and Match Verification
  await validUser.validate();
  // Simulate pre-save hook manually
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  validUser.password = await bcrypt.hash(validUser.password, salt);
  const matchResult = await validUser.matchPassword('SecurePassword123!');
  const wrongMatch = await validUser.matchPassword('WrongPassword');
  assert(matchResult === true, 'User.matchPassword returns true for correct password');
  assert(wrongMatch === false, 'User.matchPassword returns false for incorrect password');

  // Test 4: Employee Schema Validation
  const dummyUserId = new mongoose.Types.ObjectId();
  const validEmployee = new Employee({
    userId: dummyUserId,
    employeeId: 'EMP-1001',
    firstName: 'Sarah',
    lastName: 'Connor',
    department: 'Engineering',
    designation: 'Senior Developer',
  });
  assert(validEmployee.validateSync() === undefined, 'Valid Employee passes schema validation');

  const invalidEmployee = new Employee({});
  const empErr = invalidEmployee.validateSync();
  assert(empErr && empErr.errors.userId, 'Employee schema requires userId foreign key');
  assert(empErr && empErr.errors.employeeId, 'Employee schema requires employeeId');
  assert(empErr && empErr.errors.department, 'Employee schema requires department');
  assert(empErr && empErr.errors.designation, 'Employee schema requires designation');

  // Test 5: Manager Schema Validation
  const validManager = new Manager({
    userId: dummyUserId,
    department: 'Engineering',
  });
  assert(validManager.validateSync() === undefined, 'Valid Manager passes schema validation');

  // Test 6: Attendance Schema & Compound Index
  const validAttendance = new Attendance({
    employeeId: validEmployee._id,
    date: '2026-10-28',
    status: 'Present',
    hoursWorked: 8,
  });
  assert(validAttendance.validateSync() === undefined, 'Valid Attendance passes schema validation');

  const invalidAttendance = new Attendance({
    employeeId: validEmployee._id,
    date: '28/10/2026', // wrong format
    status: 'UnknownStatus',
  });
  const attErr = invalidAttendance.validateSync();
  assert(attErr && attErr.errors.date, 'Attendance schema validates YYYY-MM-DD date regex');
  assert(attErr && attErr.errors.status, 'Attendance schema restricts status to enum');

  const attIndexes = Attendance.schema.indexes();
  const hasCompoundIndex = attIndexes.some(
    ([fields, opts]) => fields.employeeId === 1 && fields.date === 1 && opts && opts.unique === true
  );
  assert(hasCompoundIndex, 'Attendance schema defines unique compound index on { employeeId: 1, date: 1 }');

  // Test 7: Leave Schema Validation
  const validLeave = new Leave({
    employeeId: validEmployee._id,
    leaveType: 'Annual',
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-05'),
    totalDays: 4,
    reason: 'Vacation',
  });
  assert(validLeave.validateSync() === undefined, 'Valid Leave passes schema validation');

  const invalidLeave = new Leave({
    employeeId: validEmployee._id,
    leaveType: 'InvalidLeaveType',
    totalDays: 0,
  });
  const leaveErr = invalidLeave.validateSync();
  assert(leaveErr && leaveErr.errors.leaveType, 'Leave schema restricts leaveType to enum');
  assert(leaveErr && leaveErr.errors.totalDays, 'Leave schema enforces minimum totalDays (>= 0.5)');

  // Test 8: Announcement Schema Validation
  const validAnnouncement = new Announcement({
    title: 'Company Townhall',
    content: 'Quarterly review on Friday.',
    priority: 'High',
    postedBy: dummyUserId,
  });
  assert(validAnnouncement.validateSync() === undefined, 'Valid Announcement passes schema validation');

  // Test 9: Training Schema Validation
  const validTraining = new Training({
    title: 'Security Compliance',
    description: 'Annual compliance review',
    trainerOrProvider: 'Internal HR',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    assignedEmployees: [{ employeeId: validEmployee._id, status: 'Enrolled' }],
  });
  assert(validTraining.validateSync() === undefined, 'Valid Training passes schema validation');

  // Test 10: Notification Schema Validation
  const validNotification = new Notification({
    recipientId: dummyUserId,
    title: 'Leave Approved',
    message: 'Your leave application has been approved by your manager.',
    type: 'Leave',
  });
  assert(validNotification.validateSync() === undefined, 'Valid Notification passes schema validation');

  console.log(`\nVerification Summary: ${passedTests}/${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('[SUCCESS] All Phase 3 Mongoose models and schema validations are intact.');
  }
}

runModelTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
