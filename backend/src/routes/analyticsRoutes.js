const express = require('express');
const router = express.Router();
const { getAssignmentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/assignment/:id', getAssignmentAnalytics);

module.exports = router;
