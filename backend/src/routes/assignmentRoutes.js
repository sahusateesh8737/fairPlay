const express = require('express');
const { createAssignment, getAssignments, getAssignment, deleteAssignment, updateAssignmentStatus } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher', 'admin'), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.patch('/:id/status', authorize('teacher', 'admin'), updateAssignmentStatus);
router.delete('/:id', authorize('teacher', 'admin'), deleteAssignment);

module.exports = router;
