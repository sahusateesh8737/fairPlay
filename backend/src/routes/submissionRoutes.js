const express = require('express');
const { 
  getAssignmentSubmissions, 
  getSubmission, 
  updateGrade,
  submitCode,
  startExamSession
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middlewares/auth');
const { enforceNetworkSecurity } = require('../middlewares/networkSecurity');
const { submissionLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(enforceNetworkSecurity);

router.post('/start', authorize('student', 'admin'), startExamSession);
router.post('/', authorize('student', 'admin'), submissionLimiter, submitCode);
router.get('/assignment/:assignmentId', authorize('teacher', 'admin'), getAssignmentSubmissions);
router.get('/:id', authorize('teacher', 'admin'), getSubmission);
router.put('/:id/grade', authorize('teacher', 'admin'), updateGrade);

module.exports = router;
