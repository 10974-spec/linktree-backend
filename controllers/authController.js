const User = require('../models/User');
const { generateAuthTokens, generateEmailVerificationToken, verifyToken } = require('../utils/generateToken');
const { validate } = require('../utils/validationSchemas');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Generate tokens
    const tokens = generateAuthTokens(user._id);

    // Generate email verification token (for future use)
    const emailVerificationToken = generateEmailVerificationToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      ...tokens,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = generateAuthTokens(user._id);

    res.json({
      message: 'Login successful',
      ...tokens,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateAuthTokens(user._id);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token required' });
    }

    // Verify email token
    const decoded = verifyToken(token, 'email-verification');
    
    // Update user verification status
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification token' });
  }
};

module.exports = { 
  register, 
  login, 
  refreshToken, 
  verifyEmail 
};