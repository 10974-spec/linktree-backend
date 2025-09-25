const express = require('express');
const { 
  register, 
  login, 
  refreshToken, 
  verifyEmail 
} = require('../controllers/authController');
const { validate } = require('../utils/validationSchemas');
const { schemas } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);

module.exports = router;