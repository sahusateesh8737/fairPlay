const express = require('express');
const { register, login, getMe, getSections } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/sections', protect, getSections);

module.exports = router;
