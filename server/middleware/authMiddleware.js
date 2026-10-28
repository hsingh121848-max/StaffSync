const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../models');

/**
 * Protect routes by verifying JWT Bearer token
 */
const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'staffsync_dev_secret_token_key_change_in_production';
    const decoded = jwt.verify(token, secret);

    // Only query database if connection is currently active (avoids Mongoose command buffering when offline)
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        user = null;
      }
    }

    if (!user) {
      // Fallback to token payload data if user record cannot be queried directly
      req.user = {
        _id: decoded.id,
        role: decoded.role,
      };
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token',
    });
  }
};

/**
 * Restrict access to authorized roles (e.g. 'hr', 'manager', 'employee')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
