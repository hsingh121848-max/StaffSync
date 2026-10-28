const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user reference is required'],
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Additional Indexes (userId is uniquely indexed via schema field)
managerSchema.index({ department: 1 });

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;
