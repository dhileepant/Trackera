const express = require('express');
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, progressController.getAnalytics);

module.exports = router;
