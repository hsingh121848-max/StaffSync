const { Announcement, User } = require('../models');

/**
 * @desc    Create and publish a company-wide announcement
 * @route   POST /api/announcements
 * @access  Private (HR)
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, targetAudience, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      postedBy: req.user._id,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active announcements
 * @route   GET /api/announcements
 * @access  Private (All Roles)
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const query = {};
    // Exclude expired announcements if expiresAt is set
    query.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete / archive an announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (HR)
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
