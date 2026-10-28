const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'staffsync_dev_secret_token_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    secret,
    {
      expiresIn,
    }
  );
};

module.exports = { generateToken };
