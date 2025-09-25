const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be longer than 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Link validation schemas
const linkSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Title is required',
      'string.max': 'Title cannot be longer than 50 characters',
      'any.required': 'Title is required'
    }),
  
  url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Please provide a valid URL',
      'any.required': 'URL is required'
    }),
  
  icon: Joi.string()
    .allow('')
    .optional()
    .max(10)
    .messages({
      'string.max': 'Icon cannot be longer than 10 characters'
    }),
  
  position: Joi.number()
    .integer()
    .min(0)
    .optional()
});

const updateLinkSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
  
  url: Joi.string()
    .uri()
    .optional(),
  
  icon: Joi.string()
    .allow('')
    .optional()
    .max(10),
  
  position: Joi.number()
    .integer()
    .min(0)
    .optional()
});

// Profile validation schemas
const profileSchema = Joi.object({
  displayName: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Display name cannot be longer than 50 characters'
    }),
  
  bio: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Bio cannot be longer than 200 characters'
    })
});

// Theme validation schema
const themeSchema = Joi.object({
  backgroundColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Background color must be a valid hex color'
    }),
  
  textColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Text color must be a valid hex color'
    }),
  
  buttonColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Button color must be a valid hex color'
    }),
  
  buttonTextColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Button text color must be a valid hex color'
    })
});

// Analytics query validation
const analyticsQuerySchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be a valid ISO date format'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'End date must be a valid ISO date format',
      'date.min': 'End date cannot be before start date'
    })
});

// Password reset validation
const passwordResetSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .required(),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
});

// Validation middleware functions
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorDetails
      });
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorDetails
      });
    }
    
    next();
  };
};

module.exports = {
  schemas: {
    register: registerSchema,
    login: loginSchema,
    link: linkSchema,
    updateLink: updateLinkSchema,
    profile: profileSchema,
    theme: themeSchema,
    analyticsQuery: analyticsQuerySchema,
    passwordReset: passwordResetSchema
  },
  validate,
  validateQuery
};