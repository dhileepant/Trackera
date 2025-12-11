const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/students', adminController.getStudents);
router.put('/students/:id', adminController.updateStudent);

router.route('/companies')
    .get(adminController.getCompanies)
    .post(adminController.createCompany);
router.route('/companies/:id')
    .put(adminController.updateCompany)
    .delete(adminController.deleteCompany);

router.route('/placements')
    .get(adminController.getPlacements)
    .post(adminController.createPlacement);
router.put('/placements/:id', adminController.updatePlacement);

module.exports = router;
