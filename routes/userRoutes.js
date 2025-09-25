const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  getProfile, 
  updateProfile, 
  updateTheme,
  uploadAvatar,
  deleteAccount 
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/theme', updateTheme);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/account', deleteAccount);

module.exports = router;