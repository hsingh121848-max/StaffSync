const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';

/**
 * Safe, idempotent database seeder for StaffSync.
 * Rule: Never overwrite or delete existing user data automatically.
 */
const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[StaffSync Seeder] Connected to MongoDB: ${conn.connection.host}`);

    // Check if HR admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@staffsync.com' });
    if (existingAdmin) {
      console.log('[StaffSync Seeder Notice] Admin account already exists. Existing data preserved; skipping duplicate insertion.');
      process.exit(0);
    }

    console.log('[StaffSync Seeder] No existing seed data detected. Creating sample dataset...');

    // 1. Create Users (passwords will be hashed automatically by User pre-save hook)
    const hrUser = await User.create({
      email: 'admin@staffsync.com',
      password: 'AdminPassword123!',
      role: 'hr',
    });

    const managerUser = await User.create({
      email: 'manager.john@staffsync.com',
      password: 'ManagerPassword123!',
      role: 'manager',
    });

    const empUser1 = await User.create({
      email: 'employee.sarah@staffsync.com',
      password: 'EmployeePassword123!',
      role: 'employee',
    });

    const empUser2 = await User.create({
      email: 'employee.alex@staffsync.com',
      password: 'EmployeePassword123!',
      role: 'employee',
    });

    // 2. Create Manager profile
    const managerProfile = await Manager.create({
      userId: managerUser._id,
      department: 'Engineering',
      teamMembers: [],
    });

    // 3. Create Employee profiles
    const empProfile1 = await Employee.create({
      userId: empUser1._id,
      employeeId: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1-555-0101',
      department: 'Engineering',
      designation: 'Senior Frontend Developer',
      dateOfJoining: new Date('2025-01-15'),
      managerId: managerProfile._id,
      address: '100 Silicon Blvd, Suite 400',
      emergencyContact: 'John Connor (+1-555-0199)',
      leaveQuota: { casual: 12, sick: 10, annual: 15 },
    });

    const empProfile2 = await Employee.create({
      userId: empUser2._id,
      employeeId: 'EMP-1002',
      firstName: 'Alex',
      lastName: 'Murphy',
      phone: '+1-555-0102',
      department: 'Engineering',
      designation: 'Backend Systems Engineer',
      dateOfJoining: new Date('2025-03-01'),
      managerId: managerProfile._id,
      address: '200 Tech Way, Floor 2',
      emergencyContact: 'Anne Murphy (+1-555-0198)',
      leaveQuota: { casual: 12, sick: 10, annual: 15 },
    });

    // Associate team members with manager
    managerProfile.teamMembers.push(empProfile1._id, empProfile2._id);
    await managerProfile.save();

    // 4. Sample Attendance
    const today = new Date().toISOString().split('T')[0];
    await Attendance.create({
      employeeId: empProfile1._id,
      date: today,
      checkInTime: new Date(new Date().setHours(9, 0, 0, 0)),
      checkOutTime: null,
      status: 'Present',
      hoursWorked: 0,
      notes: 'Morning check-in',
    });

    // 5. Sample Leave Request
    await Leave.create({
      employeeId: empProfile1._id,
      leaveType: 'Annual',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      reason: 'Personal family trip',
      status: 'Pending',
    });

    // 6. Sample Announcement
    await Announcement.create({
      title: 'Welcome to StaffSync HRMS Platform',
      content: 'We are pleased to introduce StaffSync for digital attendance, automated leave requests, and training coordination.',
      priority: 'High',
      targetAudience: 'All',
      postedBy: hrUser._id,
    });

    // 7. Sample Training Program
    await Training.create({
      title: 'Advanced Cloud Architecture & Security Practices',
      description: 'Comprehensive overview of secure microservices and distributed design.',
      trainerOrProvider: 'Enterprise Tech Academy',
      assignedEmployees: [
        {
          employeeId: empProfile1._id,
          status: 'Enrolled',
        },
        {
          employeeId: empProfile2._id,
          status: 'In Progress',
        },
      ],
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'Scheduled',
      category: 'Technical',
    });

    // 8. Sample Notification
    await Notification.create({
      recipientId: empUser1._id,
      title: 'Welcome to StaffSync',
      message: 'Your employee profile has been initialized. You can now mark attendance and request leaves.',
      type: 'General',
      isRead: false,
      actionUrl: '/profile',
    });

    console.log('[StaffSync Seeder] Database seeded successfully with initial sample accounts.');
    console.log('  HR Admin: admin@staffsync.com / AdminPassword123!');
    console.log('  Manager:  manager.john@staffsync.com / ManagerPassword123!');
    console.log('  Employee: employee.sarah@staffsync.com / EmployeePassword123!');
    console.log('  Employee: employee.alex@staffsync.com / EmployeePassword123!');

    process.exit(0);
  } catch (error) {
    console.error(`[StaffSync Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

// Add seed script execution to package.json
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
