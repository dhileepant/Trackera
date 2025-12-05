const express = require('express');
const practiceController = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/categories', practiceController.getCategories);
router.get('/category/:category', practiceController.getProblemsByCategory);
router.get('/problem/:problemId', practiceController.getProblemDetails);
router.post('/run', practiceController.runCode);
router.post('/submit', practiceController.submitCode);

module.exports = router;
