const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Engineering', 'HR', 'Sales', 'Management'],
      default: 'All',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ priority: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
