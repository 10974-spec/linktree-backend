const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAnalytics, getLinkAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAnalytics);
router.get('/link/:linkId', getLinkAnalytics);

module.exports = router;