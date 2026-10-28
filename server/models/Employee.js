const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user reference is required'],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
      default: Date.now,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
    // [RECOMMENDATION] Subdocument array for manager performance evaluation notes
    performanceNotes: [
      {
        date: { type: Date, default: Date.now },
        note: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5 },
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    // [RECOMMENDATION] Annual leave allocation balances
    leaveQuota: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      annual: { type: Number, default: 15 },
    },
  },
  {
    timestamps: true,
  }
);

// Additional Indexes (employeeId and userId are uniquely indexed via schema fields)
employeeSchema.index({ department: 1 });
employeeSchema.index({ managerId: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
