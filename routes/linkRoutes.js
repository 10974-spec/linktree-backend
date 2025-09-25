const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getUserLinks,
  createLink,
  updateLink,
  deleteLink,
  recordClick
} = require('../controllers/linkController');

const router = express.Router();

router.use(protect); // All routes below require authentication

router.get('/', getUserLinks);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);
router.post('/:id/click', recordClick);

module.exports = router;