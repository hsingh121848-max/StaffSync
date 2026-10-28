const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
      trim: true,
    },
    trainerOrProvider: {
      type: String,
      required: [true, 'Trainer or Provider name is required'],
      trim: true,
    },
    assignedEmployees: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true,
        },
        status: {
          type: String,
          enum: ['Enrolled', 'In Progress', 'Completed'],
          default: 'Enrolled',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trainingSchema.index({ status: 1 });
trainingSchema.index({ 'assignedEmployees.employeeId': 1 });

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;
