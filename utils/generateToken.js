const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string} JWT token
 */
const generateToken = (userId, type = 'access') => {
  const payload = {
    userId,
    type
  };

  const options = {
    issuer: 'linktree-clone-api',
    subject: userId.toString()
  };

  switch (type) {
    case 'access':
      return jwt.sign(payload, process.env.JWT_SECRET, {
        ...options,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
      });
    
    case 'refresh':
      return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        ...options,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      });
    
    case 'email-verification':
      return jwt.sign(payload, process.env.JWT_EMAIL_SECRET, {
        ...options,
        expiresIn: '1h' // Email verification tokens expire in 1 hour
      });
    
    case 'password-reset':
      return jwt.sign(payload, process.env.JWT_PASSWORD_SECRET, {
        ...options,
        expiresIn: '1h' // Password reset tokens expire in 1 hour
      });
    
    default:
      throw new Error('Invalid token type');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Token type
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, type = 'access') => {
  let secret;
  
  switch (type) {
    case 'access':
      secret = process.env.JWT_SECRET;
      break;
    case 'refresh':
      secret = process.env.JWT_REFRESH_SECRET;
      break;
    case 'email-verification':
      secret = process.env.JWT_EMAIL_SECRET;
      break;
    case 'password-reset':
      secret = process.env.JWT_PASSWORD_SECRET;
      break;
    default:
      throw new Error('Invalid token type');
  }

  return jwt.verify(token, secret);
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID
 * @returns {Object} Tokens object
 */
const generateAuthTokens = (userId) => {
  const accessToken = generateToken(userId, 'access');
  const refreshToken = generateToken(userId, 'refresh');
  
  return {
    accessToken,
    refreshToken,
    accessTokenExpires: getTokenExpiration(accessToken),
    refreshTokenExpires: getTokenExpiration(refreshToken)
  };
};

/**
 * Extract expiration time from token
 * @param {string} token - JWT token
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {string} Email verification token
 */
const generateEmailVerificationToken = (userId) => {
  return generateToken(userId, 'email-verification');
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} Password reset token
 */
const generatePasswordResetToken = (userId) => {
  return generateToken(userId, 'password-reset');
};

/**
 * Extract user ID from token without verification (for non-critical operations)
 * @param {string} token - JWT token
 * @returns {string} User ID
 */
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
  getTokenExpiration,
  isTokenExpired,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  getUserIdFromToken
};