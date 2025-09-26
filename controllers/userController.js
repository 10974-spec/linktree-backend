const User = require('../models/User');
const Link = require('../models/Link');
const Analytics = require('../models/Analytics');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.displayName': displayName,
        'profile.bio': bio
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { backgroundColor, textColor, buttonColor, buttonTextColor } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.theme': {
          backgroundColor,
          textColor,
          buttonColor,
          buttonTextColor
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Theme updated successfully',
      theme: user.profile.theme
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // For now, we'll use local file path
    // In production, you'd upload to Cloudinary and save the URL
    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatarPath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.profile.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ message: 'Please confirm your password' });
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(confirmPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Delete user data
    await Link.deleteMany({ user: req.user._id });
    await Analytics.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username, exclude sensitive data
    const user = await User.findOne({ username })
      .select('-password -email -isVerified -createdAt -updatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's active links
    const links = await Link.find({ 
      user: user._id, 
      isActive: true 
    }).sort({ position: 1 }).select('-user -__v');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        profile: user.profile
      },
      links
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  getProfile,
  updateProfile,
  updateTheme,
  uploadAvatar,
  deleteAccount,
  getPublicProfile
};