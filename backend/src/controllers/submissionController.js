const prisma = require('../config/prisma');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Teacher/Admin)
exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: parseInt(req.params.assignmentId) },
      include: {
        student: { select: { id: true, name: true, email: true } },
        _count: { select: { cheatLogs: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single submission details
// @route   GET /api/submissions/:id
// @access  Private (Teacher/Admin)
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        student: { select: { name: true, email: true } },
        files: true,
        cheatLogs: true,
        assignment: { select: { title: true } }
      }
    });

    if (!submission) {
      return next(new ErrorResponse('Submission not found', 404));
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update submission grade
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher/Admin)
exports.updateGrade = async (req, res, next) => {
  try {
    const { score } = req.body;

    const submission = await prisma.submission.update({
      where: { id: parseInt(req.params.id) },
      data: {
        score: parseFloat(score)
      }
    });

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Submit code for an assignment
// @route   POST /api/submissions
// @access  Private (Student)
exports.submitCode = async (req, res, next) => {
  try {
    const { assignmentId, questionId, files, cheatLogs } = req.body;

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: parseInt(assignmentId),
        questionId: questionId ? parseInt(questionId) : null,
        studentId: req.user.id,
        files: {
          create: Object.keys(files).map(fileName => ({
            fileName,
            code: files[fileName]
          }))
        },
        cheatLogs: {
          create: cheatLogs.map(log => ({
            eventType: log.eventType,
            eventTimestamp: new Date() // In real app, might want to use log.timestamp
          }))
        }
      }
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (err) {
    next(err);
  }
};
