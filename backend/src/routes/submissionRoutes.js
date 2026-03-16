const express = require('express');
const { 
  getAssignmentSubmissions, 
  getSubmission, 
  updateGrade,
  submitCode
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student', 'admin'), submitCode);
router.get('/assignment/:assignmentId', authorize('teacher', 'admin'), getAssignmentSubmissions);
router.get('/:id', authorize('teacher', 'admin'), getSubmission);
router.put('/:id/grade', authorize('teacher', 'admin'), updateGrade);

module.exports = router;
