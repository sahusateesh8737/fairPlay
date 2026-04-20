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
        student: { select: { id: true, name: true, email: true, section: { select: { name: true } } } },
        question: { select: { id: true, prompt: true } },
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
        student: { select: { name: true, email: true, section: { select: { name: true } } } },
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

// @desc    Start an exam session (record start time)
// @route   POST /api/submissions/start
// @access  Private (Student)
exports.startExamSession = async (req, res, next) => {
  try {
    const { assignmentId } = req.body;
    const studentId = req.user.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    // Upsert session (if they refresh, they keep the original start time)
    const session = await prisma.examSession.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId: parseInt(assignmentId)
        }
      },
      update: {}, // Don't update startedAt if it already exists
      create: {
        studentId,
        assignmentId: parseInt(assignmentId)
      }
    });

    // Calculate endTime
    let endTime = null;
    if (assignment.durationMinutes) {
      endTime = new Date(session.startedAt.getTime() + assignment.durationMinutes * 60000);
    }

    res.status(200).json({
      success: true,
      data: {
        startedAt: session.startedAt,
        endTime,
        durationMinutes: assignment.durationMinutes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update submission grade and feedback
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher/Admin)
exports.updateGrade = async (req, res, next) => {
  try {
    const { score, teacherFeedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: parseInt(req.params.id) },
      data: {
        score: score !== undefined ? parseFloat(score) : undefined,
        teacherFeedback: teacherFeedback || undefined
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

// @desc    Get all submissions for the logged-in student
// @route   GET /api/submissions/student/my-results
// @access  Private (Student)
exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { studentId: req.user.id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            dueDate: true,
            language: true,
            difficulty: true
          }
        }
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

    // --- SECURE TIMER VALIDATION ---
    if (assignment.durationMinutes) {
      const session = await prisma.examSession.findUnique({
        where: {
          studentId_assignmentId: {
            studentId: req.user.id,
            assignmentId: parseInt(assignmentId)
          }
        }
      });

      if (!session) {
        return next(new ErrorResponse('Exam session not started. Please start the exam properly.', 403));
      }

      const now = new Date();
      const endTime = new Date(session.startedAt.getTime() + assignment.durationMinutes * 60000);
      const gracePeriodMs = 30000; // 30 seconds

      if (now.getTime() > endTime.getTime() + gracePeriodMs) {
        return next(new ErrorResponse('Submission rejected: Time limit exceeded.', 403));
      }
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
          create: cheatLogs.map(log => {
            const parsedDate = new Date(log.isoTimestamp || new Date().toISOString());
            return {
              eventType: log.eventType,
              eventTimestamp: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
              screenshot: log.screenshot || null
            };
          })
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
