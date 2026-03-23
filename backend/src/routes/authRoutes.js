const express = require('express');
const { register, login, getMe, getSections, updateProfile, getStudentsBySection } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.get('/sections', protect, getSections);
router.put('/profile', protect, updateProfile);
router.get('/students', protect, getStudentsBySection);

module.exports = router;
