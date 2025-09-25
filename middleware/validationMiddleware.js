const { body, validationResult } = require('express-validator');

// Validation rules
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateLink = [
  body('title')
    .isLength({ min: 1, max: 50 })
    .withMessage('Title must be between 1-50 characters'),
  
  body('url')
    .isURL()
    .withMessage('Please provide a valid URL')
];

const validateProfile = [
  body('displayName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Display name must be less than 50 characters'),
  
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Bio must be less than 200 characters')
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateLink,
  validateProfile,
  handleValidationErrors
};