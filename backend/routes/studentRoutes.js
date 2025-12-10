const express = require('express');
const studentController = require('../controllers/studentController');
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', studentController.getProfile);
router.get('/placements', studentController.getPlacements);
router.get('/platform-stats', studentController.getPlatformStats);
router.put('/profile', studentController.updateProfile);
router.put('/update-platforms', studentController.updatePlatforms);
router.post('/sync-platforms', studentController.syncPlatforms);

// Activity Heatmap Routes
router.get('/activity', activityController.getActivity);
router.post('/activity/update', activityController.updateActivity);

module.exports = router;
